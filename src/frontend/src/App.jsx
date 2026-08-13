import React, { useEffect, useState, useCallback } from "react";
import { api } from "./api.js";
import ItemList from "./components/ItemList.jsx";
import ItemFormModal from "./components/ItemFormModal.jsx";
import CategoryManagerModal from "./components/CategoryManagerModal.jsx";
import NotificationBell from "./components/NotificationBell.jsx";

export default function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeItem, setActiveItem] = useState(null); // object = editing, "new" = creating, null = closed
  const [showCategoryManager, setShowCategoryManager] = useState(false);

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
    } catch (err) {
      setLoadError(err.message || "Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    // Keep the notification bell fresh without needing a full page reload.
    const interval = setInterval(loadAll, 60_000);
    return () => clearInterval(interval);
  }, [loadAll]);

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

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1 className="topbar__title">
          Renewals <span className="eyebrow">tracker</span>
        </h1>
        <div className="topbar__actions">
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
        <ItemList items={items} onSelect={(item) => setActiveItem(item)} />
      )}

      {activeItem && (
        <ItemFormModal
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
