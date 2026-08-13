import React, { useState } from "react";
import { api } from "../api.js";

export default function CategoryManagerModal({ categories, onClose, onChanged }) {
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📌");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    try {
      await api.createCategory({ name: newName.trim(), icon: newIcon.trim() || "📌" });
      setNewName("");
      setNewIcon("📌");
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditIcon(c.icon || "📌");
  }

  async function saveEdit(id) {
    setError("");
    try {
      await api.updateCategory(id, { name: editName.trim(), icon: editIcon.trim() || "📌" });
      setEditingId(null);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category? Items using it will just show without a category.")) return;
    setError("");
    try {
      await api.deleteCategory(id);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>Categories</h2>
          <button className="close-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <div className="category-list">
          {categories.map((c) => (
            <div className="category-row" key={c.id}>
              {editingId === c.id ? (
                <>
                  <input
                    style={{ width: 44, textAlign: "center", border: "1px solid var(--line)", borderRadius: 6, padding: "4px" }}
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                  />
                  <input
                    style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 6, padding: "6px 8px" }}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <div className="category-row__actions">
                    <button className="icon-btn" onClick={() => saveEdit(c.id)}>Save</button>
                    <button className="icon-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="category-row__icon">{c.icon}</span>
                  <span className="category-row__name">{c.name}</span>
                  <div className="category-row__actions">
                    <button className="icon-btn" onClick={() => startEdit(c)}>Edit</button>
                    <button className="icon-btn" onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <form className="category-add-row" onSubmit={handleCreate}>
          <input
            type="text"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            aria-label="Icon"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>
      </div>
    </div>
  );
}
