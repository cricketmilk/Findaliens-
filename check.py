#!/usr/bin/env python3
"""check.py - is the site up, is the trapdoor wired, is the trap catching?

    python check.py                 # check the live domain
    python check.py --base https://findaliens.crinkle.workers.dev
    python check.py --no-trap       # skip the node-A checks (offline/dev)

Every failure this repo has actually suffered is an assertion below. The point
is that "it deployed" and "it works" are different claims, and only one of them
is worth making. A deploy that reports success while the domain serves a stale
build, or serves the build plus the config file next to it, has not worked.

Exit code is 0 only if every check passes, so it can gate a deploy:

    python check.py && echo ok
"""
import argparse
import json
import sys
import urllib.error
import urllib.request

SITE = "https://findaliens.net"
TRAP = "https://sixoxis.goblinhouse.net"
UA = "findaliens-check/1.0 (+repo smoke test)"

_fails = []


def get(url, redirect=True, timeout=25, ua=UA, cookie=None):
    """-> (status, body, headers). Never raises; a dead host is a failed check,
    not a traceback."""
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k):
            return None

    op = urllib.request.build_opener(*([] if redirect else [NoRedirect]))
    req = urllib.request.Request(url, headers={"User-Agent": ua})
    if cookie:
        req.add_header("Cookie", cookie)
    try:
        r = op.open(req, timeout=timeout)
        return r.status, r.read().decode("utf-8", "replace"), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace"), dict(e.headers)
    except Exception as e:
        return 0, "%s: %s" % (type(e).__name__, e), {}


def check(label, ok, detail=""):
    print("  %-4s %-46s %s" % ("PASS" if ok else "FAIL", label, detail))
    if not ok:
        _fails.append(label)
    return ok


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--base", default=SITE)
    p.add_argument("--trap", default=TRAP)
    p.add_argument("--no-trap", action="store_true")
    a = p.parse_args()
    base = a.base.rstrip("/")

    print("\nthe site  (%s)" % base)
    st, body, _ = get(base + "/")
    check("serves 200", st == 200, "status=%s" % st)
    check("is the gazette", "Cornfield Gazette" in body)
    # The sprite is the regression that keeps happening: a stale deploy still
    # renders fine, it just renders the old vector Maizey.
    check("pixel Maizey, not the old vector SVG",
          "img/maizey.png" in body and 'viewBox="0 0 120 172"' not in body)
    ist, _, ih = get(base + "/img/maizey.png")
    check("sprite actually loads", ist == 200 and ih.get("Content-Type", "").startswith("image/"),
          "status=%s" % ist)

    print("\nthe trapdoor")
    check("hidden nofollow link present", "sixoxis.goblinhouse.net/maze/root" in body)
    rst, robots, _ = get(base + "/robots.txt")
    # Cloudflare's Managed robots.txt silently replaces this file if it is on
    # for the zone, which disables the honeytoken without any error anywhere.
    check("robots.txt is ours, not Cloudflare Managed",
          rst == 200 and "archive/drafts" in robots,
          "managed robots.txt is shadowing it" if rst == 200 and "archive/drafts" not in robots else "")
    hst, _, hh = get(base + "/archive/drafts/x", redirect=False)
    check("honeytoken redirects into the maze",
          hst in (301, 302) and "sixoxis" in (hh.get("Location") or ""),
          "status=%s -> %s" % (hst, hh.get("Location")))

    print("\nnothing leaked  (the repo root must never be published)")
    for path in ("/wrangler.jsonc", "/README.md", "/worker.js", "/check.py",
                 "/.gitignore", "/.wrangler/cache/wrangler-account.json",
                 "/unremarkable-human/src/app.js"):
        s, _, _ = get(base + path)
        check("404: %s" % path, s == 404, "status=%s" % s)

    if not a.no_trap:
        trap = a.trap.rstrip("/")
        print("\nthe trap  (%s)" % trap)
        mst, maze, mh = get(trap + "/maze/root")
        check("node A serves the maze", mst == 200, "status=%s" % mst)
        check("ladder notice is served", "SYSTEM NOTICE" in maze)
        check("maze offers onward links", maze.count('href="/maze/') >= 2)
        # The census surface is deliberately crawlable; what must never be
        # allowed is the maze and the honeytokens.
        _, trobots, _ = get(trap + "/robots.txt")
        check("maze is robots-disallowed", "Disallow: /maze/" in trobots)
        check("honeytokens are robots-disallowed", "Disallow: /private/keys" in trobots)
        # Stance escalation is the one signal that proves the Hive is keeping
        # per-catch state rather than just serving pages.
        cookie = None
        _, _, h = get(trap + "/maze/root", cookie=None)
        sc = h.get("Set-Cookie", "")
        if "gsmr=" in sc:
            cookie = sc.split(";")[0]
        check("a catch is opened (gsmr cookie)", bool(cookie), cookie or "no cookie set")
        check("stance header present", "X-Kult-Stance" in h,
              h.get("X-Kult-Stance", ""))

    print()
    if _fails:
        print("%d FAILED: %s\n" % (len(_fails), "; ".join(_fails)))
        return 1
    print("all checks passed\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
