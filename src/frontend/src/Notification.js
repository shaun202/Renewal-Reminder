// Wraps the browser's native Notification API so App.jsx can fire an actual
// OS-level popup when a reminder becomes active - separate from the in-app
// bell, which only shows up while the tab is open and focused.

const STORAGE_KEY = "renewalReminder.notifiedKeys";

function loadNotifiedKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifiedKeys(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // Not critical - worst case we just re-notify once.
  }
}

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPermission() {
  return isNotificationSupported() ? Notification.permission : "unsupported";
}

// Must be called from a user gesture (e.g. a button click) in most browsers.
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.requestPermission();
}

// Fires a real popup for every active reminder we haven't already shown one
// for. Keyed by item + which offset triggered it + the deadline itself, so a
// recurring item that rolls forward to a new deadline can notify again later
// instead of being permanently silenced.
export function notifyNewReminders(activeNotifications) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  if (!Array.isArray(activeNotifications) || activeNotifications.length === 0) return;

  const notified = loadNotifiedKeys();
  let changed = false;

  for (const n of activeNotifications) {
    const key = `${n.itemId}:${n.triggeredOffset}:${n.deadline}`;
    if (notified.has(key)) continue;

    try {
      new Notification(n.title, {
        body: n.timeLeftLabel,
        tag: key // replaces any existing browser notification with the same tag instead of stacking duplicates
      });
    } catch {
      // Some browsers (mostly mobile) don't allow `new Notification()` directly.
      // Skipping silently is fine - the in-app bell still covers it.
    }

    notified.add(key);
    changed = true;
  }

  if (changed) saveNotifiedKeys(notified);
}