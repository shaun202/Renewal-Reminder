import React, { useState, useRef, useEffect } from "react";

export default function NotificationBell({ notifications, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasNotifications = notifications.length > 0;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn-icon" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        🔔
        {hasNotifications && <span className="bell-dot" />}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel__header">
            {hasNotifications ? `${notifications.length} reminder${notifications.length === 1 ? "" : "s"}` : "Reminders"}
          </div>

          {!hasNotifications && <div className="notif-empty">You're all caught up — nothing due soon.</div>}

          {notifications.map((n) => (
            <div
              key={n.itemId}
              className="notif-row"
              onClick={() => {
                setOpen(false);
                onSelect(n.itemId);
              }}
            >
              <span className={`notif-row__dot dot-${n.urgency}`} />
              <span className="notif-row__title">{n.title}</span>
              <span className={`notif-row__time urgency-${n.urgency}`}>{n.timeLeftLabel}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
