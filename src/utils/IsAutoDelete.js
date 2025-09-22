// src/utils/lsAutoDelete.js
const META_PREFIX = "__ls_delete__:"; // stored in localStorage to persist expiry
const MAX_TIMEOUT = 2147483647; // max safe setTimeout (~24.85 days)
const timers = (typeof window !== "undefined" && window.__lsDeletionTimers) || {};
if (typeof window !== "undefined") window.__lsDeletionTimers = timers;

function _metaKey(key) {
  return META_PREFIX + key;
}

function _saveMeta(key, expiresAt) {
  try {
    localStorage.setItem(_metaKey(key), JSON.stringify({ expiresAt }));
  } catch (e) {
    console.error("lsAutoDelete: failed to save meta", e);
  }
}

function _removeMeta(key) {
  try {
    localStorage.removeItem(_metaKey(key));
  } catch (e) {
    console.error("lsAutoDelete: failed to remove meta", e);
  }
}

function _clearTimer(key) {
  const id = timers[key];
  if (id != null) {
    clearTimeout(id);
    delete timers[key];
  }
}

function _performDeletion(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error("lsAutoDelete: failed to remove key", key, e);
  } finally {
    _clearTimer(key);
    _removeMeta(key);
  }
}

function _scheduleNextTick(key, expiresAt) {
  _clearTimer(key);
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) {
    // already expired
    _performDeletion(key);
    return;
  }

  const chunk = remaining > MAX_TIMEOUT ? MAX_TIMEOUT : remaining;
  // store timer id so we can cancel later
  timers[key] = setTimeout(() => {
    // if there is still time left after this chunk, schedule again
    if (expiresAt - Date.now() > 0) {
      _scheduleNextTick(key, expiresAt);
    } else {
      _performDeletion(key);
    }
  }, chunk);
}

/**
 * Schedule deletion of localStorage key after given milliseconds.
 * Persisted across reloads. Safe for long delays.
 *
 * @param {string} key - localStorage key to delete
 * @param {number} ms - milliseconds delay (e.g. 30*24*60*60*1000)
 */
export function scheduleDeletionAfterMs(key, ms) {
  if (typeof window === "undefined" || !key) return;
  const expiresAt = Date.now() + Math.max(0, Number(ms) || 0);
  _saveMeta(key, expiresAt);
  _scheduleNextTick(key, expiresAt);
}

/**
 * Schedule deletion after given days (convenience).
 * @param {string} key
 * @param {number} days
 */
export function scheduleDeletionAfterDays(key, days = 30) {
  const ms = Math.round(days * 24 * 60 * 60 * 1000);
  scheduleDeletionAfterMs(key, ms);
  return true;
}

/**
 * Cancel a scheduled deletion (if any).
 * @param {string} key
 */
export function cancelScheduledDeletion(key) {
  if (typeof window === "undefined" || !key) return;
  _clearTimer(key);
  _removeMeta(key);
}

/**
 * Restore scheduled deletions from localStorage metadata.
 * Call once on app startup (e.g. in App useEffect).
 */
export function restoreScheduledDeletions() {
  if (typeof window === "undefined") return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const metaKey = localStorage.key(i);
      if (!metaKey || !metaKey.startsWith(META_PREFIX)) continue;
      const key = metaKey.slice(META_PREFIX.length);
      try {
        const meta = JSON.parse(localStorage.getItem(metaKey));
        const expiresAt = meta && Number(meta.expiresAt);
        if (!expiresAt) {
          _removeMeta(key);
          continue;
        }
        if (Date.now() >= expiresAt) {
          // expired while the app was closed
          _performDeletion(key);
        } else {
          _scheduleNextTick(key, expiresAt);
        }
      } catch (e) {
        console.error("lsAutoDelete: bad meta for", key, e);
        _removeMeta(key);
      }
    }
  } catch (e) {
    console.error("lsAutoDelete: restore failed", e);
  }
}
