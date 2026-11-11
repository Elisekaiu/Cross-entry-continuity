// Copy to config.js locally. Never commit config.js (it contains your token).
// The reference collector listens only on loopback; use a private tunnel
// with HTTPS + proper auth for truly remote deployments.
export const CONFIG = Object.freeze({
  base: 'http://127.0.0.1:8794',
  token: 'REPLACE_WITH_YOUR_LOCAL_DEMO_TOKEN',
  enabled: false, // false = preview only, no automatic chat uploads
  maxMessages: 4,
  maxChars: 600
});
