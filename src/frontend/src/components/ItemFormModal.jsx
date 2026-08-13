import React, { useState } from "react";
import { api } from "../api.js";

const QUICK_OFFSETS = [1, 3, 7, 14, 30];

function toFormState(item) {
  return {
    title: item?.title ?? "",
    amount: item?.amount ?? "",
    deadline: item?.deadline ?? "",
    categoryId: item?.categoryId ?? "",
    description: item?.description ?? "",
    reminderOffsets: item?.reminderOffsets ?? [7]
  };
}

export default function ItemFormModal({ item, categories, onClose, onSaved, onDeleted, onManageCategories }) {
  const isEdit = Boolean(item?.id);
  const [form, setForm] = useState(() => toFormState(item));
  const [customOffset, setCustomOffset] = useState("");
  const [saved, setSaved] = useState(item?.id ? item : null); // server response, drives the warning banner
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleOffset(value) {
    setForm((f) => {
      const has = f.reminderOffsets.includes(value);
      const next = has
        ? f.reminderOffsets.filter((o) => o !== value)
        : [...f.reminderOffsets, value];
      return { ...f, reminderOffsets: next };
    });
  }

  function addCustomOffset() {
    const n = parseInt(customOffset, 10);
    if (Number.isFinite(n) && n >= 0 && !form.reminderOffsets.includes(n)) {
      setForm((f) => ({ ...f, reminderOffsets: [...f.reminderOffsets, n] }));
    }
    setCustomOffset("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        amount: form.amount === "" ? null : Number(form.amount),
        deadline: form.deadline,
        categoryId: form.categoryId || null,
        description: form.description,
        reminderOffsets: form.reminderOffsets
      };

      const response = saved?.id
        ? await api.updateItem(saved.id, payload)
        : await api.createItem(payload);

      setSaved(response);
      onSaved(response);

      // If everything looks good (no warning), close right away.
      if (!response.warning) {
        onClose();
      }
    } catch (err) {
      setFormError(err.message || "Something went wrong saving this item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!saved?.id) return;
    if (!confirm(`Delete "${saved.title}"? This can't be undone.`)) return;
    await api.deleteItem(saved.id);
    onDeleted(saved.id);
    onClose();
  }

  function applySuggestion(offset) {
    setForm((f) => ({ ...f, reminderOffsets: [...f.reminderOffsets, offset] }));
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>{isEdit ? "Edit renewal" : "Add renewal"}</h2>
          <button className="close-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        {formError && <div className="form-error-banner">{formError}</div>}

        {saved?.warning && (
          <div className="warning-banner">
            <div>
              <strong>Heads up —</strong> {saved.warning}
              {saved.suggestedAdditionalOffsets?.length > 0 && (
                <div className="suggestion-row">
                  {saved.suggestedAdditionalOffsets.map((o) => (
                    <button
                      type="button"
                      key={o}
                      className="suggestion-chip"
                      onClick={() => applySuggestion(o)}
                    >
                      + Remind me {o} {o === 1 ? "day" : "days"} before
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="title">Name / Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Netflix, Car Insurance, Domain: mysite.com"
              required
            />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="deadline">Renewal date</label>
              <input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Category (optional)</label>
            <select id="category" value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <button type="button" className="btn-text" onClick={onManageCategories} style={{ marginTop: 6, padding: 0 }}>
              Manage categories
            </button>
          </div>

          <div className="field">
            <label htmlFor="description">Description / Notes (optional)</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Any details worth remembering..."
            />
          </div>

          <div className="field">
            <label>Remind me before it renews</label>
            <div className="offset-chips">
              {QUICK_OFFSETS.map((o) => (
                <button
                  type="button"
                  key={o}
                  className={`offset-chip ${form.reminderOffsets.includes(o) ? "active" : ""}`}
                  onClick={() => toggleOffset(o)}
                >
                  {o} {o === 1 ? "day" : "days"} before
                </button>
              ))}
              {form.reminderOffsets
                .filter((o) => !QUICK_OFFSETS.includes(o))
                .map((o) => (
                  <button
                    type="button"
                    key={o}
                    className="offset-chip active"
                    onClick={() => toggleOffset(o)}
                  >
                    {o} {o === 1 ? "day" : "days"} before
                    <span className="offset-chip-remove">×</span>
                  </button>
                ))}
            </div>
            <div className="add-offset-row">
              <input
                type="number"
                min="0"
                placeholder="Custom"
                value={customOffset}
                onChange={(e) => setCustomOffset(e.target.value)}
              />
              <button type="button" className="btn-ghost btn" onClick={addCustomOffset}>Add</button>
            </div>
            <div className="field-hint">Tap a chip to toggle it. You can set more than one reminder per item.</div>
          </div>

          <div className="modal__footer">
            <div>
              {isEdit && (
                <button type="button" className="btn-danger-text" onClick={handleDelete}>
                  Delete
                </button>
              )}
            </div>
            <div className="modal__footer-right">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
