// The Wire — one Durable Object holding what Müt last said on this site.
//
// State: the latest message, the last 200 message ids (replay protection),
// and a per-minute post count. SQLite-backed so it costs nothing at rest.
// The Worker (../worker.js) has already checked the bearer token and the
// clock skew before anything reaches here; this class only has to be honest
// about "have I seen this id" and "is someone hammering".
//
// Not in this file on purpose: WebSockets (nothing to justify a live
// connection for a message whose dwell floor is seconds) and any notion of
// who is reading. /latest is public; it says nothing a visitor could not see
// on the page.

const MAX_SEEN = 200;
const MAX_PER_MINUTE = 30;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export class Wire {
  constructor(state) {
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS latest (k TEXT PRIMARY KEY, v TEXT NOT NULL)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS seen (id TEXT PRIMARY KEY, at INTEGER NOT NULL)`);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/latest") {
      const row = this.sql.exec(`SELECT v FROM latest WHERE k = 'msg'`).toArray()[0];
      return json(row ? JSON.parse(row.v) : null);
    }

    if (url.pathname === "/say") {
      let msg;
      try { msg = await request.json(); } catch { return json({ ok: false, error: "bad json" }, 400); }
      const now = Date.now();

      if (this.sql.exec(`SELECT 1 FROM seen WHERE id = ?`, msg.id).toArray().length) {
        return json({ ok: false, error: "replay" }, 409);
      }
      const recent = this.sql.exec(`SELECT COUNT(*) AS n FROM seen WHERE at > ?`, now - 60000).one().n;
      if (recent >= MAX_PER_MINUTE) {
        return json({ ok: false, error: "rate" }, 429);
      }

      this.sql.exec(`INSERT INTO seen (id, at) VALUES (?, ?)`, msg.id, now);
      this.sql.exec(
        `DELETE FROM seen WHERE id NOT IN (SELECT id FROM seen ORDER BY at DESC LIMIT ?)`,
        MAX_SEEN
      );
      this.sql.exec(`INSERT OR REPLACE INTO latest (k, v) VALUES ('msg', ?)`, JSON.stringify(msg));
      return json({ ok: true, id: msg.id, at: msg.at, ttl: msg.ttl });
    }

    if (url.pathname === "/clear") {
      this.sql.exec(`DELETE FROM latest WHERE k = 'msg'`);
      return json({ ok: true });
    }

    return json({ ok: false, error: "not found" }, 404);
  }
}
