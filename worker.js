// The whole Worker: hand every request to the static asset store. This shim
// exists because an assets-ONLY Worker (no script) does not execute on zone
// routes — and zone routes are how this site answers on findaliens.net ahead
// of the registrar's parked DNS records.
export default {
  fetch: (request, env) => env.ASSETS.fetch(request),
};
