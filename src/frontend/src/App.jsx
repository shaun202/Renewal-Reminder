import React, { useEffect, useState, useCallback } from "react";
import { api } from "./api.js";
import ItemList from "./components/ItemList.jsx";
import ItemFormModal from "./components/ItemFormModal.jsx";
import CategoryManagerModal from "./components/CategoryManagerModal.jsx";
import NotificationBell from "./components/NotificationBell.jsx";
import {
  isNotificationSupported,
  getPermission,
  requestNotificationPermission,
  notifyNewReminders
} from "./notifications.js";

export default function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notifPermission, setNotifPermission] = useState(getPermission());

  const [activeItem, setActiveItem] = useState(null); // object = editing, "new" = creating, null = closed
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const modalOpen = activeItem !== null || showCategoryManager;

  const loadAll = useCallback(async () => {
    try {
      const [itemsRes, categoriesRes, notifsRes] = await Promise.all([
        api.getItems(),
        api.getCategories(),
        api.getNotifications()
      ]);
      setItems(itemsRes);
      setCategories(categoriesRes);
      setNotifications(notifsRes);
      setLoadError("");
      notifyNewReminders(notifsRes);
    } catch (err) {
      setLoadError(err.message || "Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    // Pause background polling while a modal is open, so a form the user is
    // actively filling in never gets fresh props pushed into it mid-edit.
    if (modalOpen) return;
    const interval = setInterval(loadAll, 60_000);
    return () => clearInterval(interval);
  }, [loadAll, modalOpen]);

  async function handleEnableNotifications() {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
  }

  function handleSaved() {
    loadAll();
  }

  function handleDeleted() {
    loadAll();
  }

  function openItemById(id) {
    const found = items.find((i) => i.id === id);
    if (found) setActiveItem(found);
  }

  async function handleMarkPaid(item) {
    const nextStep = item.cycleType === "ONE_TIME"
      ? "It's a one-time item, so it'll be removed from the list."
      : `It'll roll forward to its next due date (${item.cycleLabel}).`;

    if (!confirm(`Mark "${item.title}" as paid?\n\n${nextStep}`)) return;

    try {
      await api.completeItem(item.id);
      loadAll();
    } catch (err) {
      alert(err.message || "Couldn't mark this item as paid.");
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1 className="topbar__title">
          Renewals <span className="eyebrow">tracker</span>
        </h1>
        <div className="topbar__actions">
          {isNotificationSupported() && notifPermission === "default" && (
            <button className="btn btn-ghost" onClick={handleEnableNotifications}>
              🔔 Enable notifications
            </button>
          )}
          <NotificationBell notifications={notifications} onSelect={openItemById} />
          <button className="btn btn-primary" onClick={() => setActiveItem("new")}>
            + Add item
          </button>
        </div>
      </header>

      {loadError && (
        <div className="form-error-banner" style={{ marginBottom: 20 }}>
          {loadError} — is the backend running on port 8080?
        </div>
      )}

      {!loading && !loadError && (
        <ItemList items={items} onSelect={(item) => setActiveItem(item)} onMarkPaid={handleMarkPaid} />
      )}

      {activeItem && (
        <ItemFormModal
          key={activeItem === "new" ? "new" : activeItem.id}
          item={activeItem === "new" ? null : activeItem}
          categories={categories}
          onClose={() => setActiveItem(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onManageCategories={() => setShowCategoryManager(true)}
        />
      )}

      {showCategoryManager && (
        <CategoryManagerModal
          categories={categories}
          onClose={() => setShowCategoryManager(false)}
          onChanged={loadAll}
        />
      )}
    </div>
  );
}