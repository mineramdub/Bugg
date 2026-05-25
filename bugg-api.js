// bugg-api.js — drop-in client for the Bugg backend.
// Include before app.jsx in index.html (regular <script>, no Babel needed).
//
// Usage:
//   const api = BuggAPI.create();
//   const { bug, device } = await api.getBugOfTheDay();
//   const result = await api.submit(bug.id, draftText);
//   const stats  = await api.getStats();

(function (global) {
  const SUPABASE_URL = "https://cyfzahgqjphvzltxhgbk.supabase.co";
  const ANON_KEY    = "sb_publishable_6wLVkZPRpUZfhir79Q-IZg_Sc3C4Wnz";
  const BASE        = SUPABASE_URL + "/functions/v1/api";
  const STORAGE_KEY = "bugg.device_id";

  // ── device id: stable client UUID kept in localStorage ───────────────────
  function getOrCreateDeviceId() {
    try {
      let id = localStorage.getItem(STORAGE_KEY);
      if (!id) {
        id = (crypto.randomUUID && crypto.randomUUID()) ||
             ("dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36));
        localStorage.setItem(STORAGE_KEY, id);
      }
      return id;
    } catch (_e) {
      // private browsing / no storage → ephemeral id (no streak persistence)
      return "ephemeral-" + Math.random().toString(36).slice(2);
    }
  }

  async function call(path, init = {}) {
    const res = await fetch(BASE + path, {
      ...init,
      headers: {
        "Authorization": "Bearer " + ANON_KEY,
        "apikey": ANON_KEY,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });
    let body = null;
    try { body = await res.json(); } catch (_e) { /* empty */ }
    if (!res.ok) {
      const err = new Error((body && body.error) || ("HTTP " + res.status));
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  }

  function create(opts = {}) {
    const device_id = opts.device_id || getOrCreateDeviceId();

    return {
      device_id,

      // GET the bug to display today (depends on user's current streak).
      // Returns { bug: {id, day, difficulty, title, desc, code, bugLine, hint, xp},
      //          device: { streak, best_streak, total_xp, bugs_solved, already_solved_today } }
      getBugOfTheDay() {
        return call("/bug-of-the-day?device_id=" + encodeURIComponent(device_id));
      },

      // POST a fix attempt. The server validates against accept regexes
      // and returns the explanation + canonical answer regardless of correctness.
      // Returns { correct, xp_awarded, already_solved_today, explanation, answer,
      //          device: { streak, best_streak, total_xp, bugs_solved } }
      submit(bug_id, draft) {
        return call("/submit", {
          method: "POST",
          body: JSON.stringify({ device_id, bug_id, draft }),
        });
      },

      // GET stats + last 50 attempts.
      getStats() {
        return call("/stats?device_id=" + encodeURIComponent(device_id));
      },

      // Reset the device id (e.g. for a "Sign out / start over" affordance).
      resetDevice() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (_e) {}
      },
    };
  }

  global.BuggAPI = { create, getOrCreateDeviceId };
})(window);
