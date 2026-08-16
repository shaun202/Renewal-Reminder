import React, { useState } from "react";
import { api } from "../api.js";

const QUICK_OFFSETS = [1, 3, 7, 14, 30];

const CYCLE_OPTIONS = [
  { value: "ONE_TIME", label: "One-time", hint: "Final payment — no need to renew or pay again." },
  { value: "MONTHLY", label: "Monthly", hint: "Renews every month." },
  { value: "YEARLY", label: "Yearly", hint: "Renews every year." },
  { value: "CUSTOM", label: "Custom", hint: "Set your own interval." }
];

const INTERVAL_UNITS = [
  { value: "DAYS", label: "Days" },
  { value: "WEEKS", label: "Weeks" },
  { value: "MONTHS", label: "Months" },
  { value: "YEARS", label: "Years" }
];

function toFormState(item) {
  return {
    title: item?.title ?? "",
    amount: item?.amount ?? "",
    deadline: item?.deadline ?? "",
    categoryId: item?.categoryId ?? "",
    description: item?.description ?? "",
    reminderOffsets: item?.reminderOffsets ?? [7],
    cycleType: item?.cycleType ?? "ONE_TIME",
    customIntervalValue: item?.customIntervalValue ?? 1,
    customIntervalUnit: item?.customIntervalUnit ?? "MONTHS"
  };
}

export default function ItemFormModal({ item, categories, onClose, onSaved, onDeleted, onManageCategories }) {
  const isEdit = Boolean(item?.id);
  const [step, setStep] = useState(1); // 1 = details, 2 = renewal cycle + save
  const [form, setForm] = useState(() => toFormState(item));
  const [customOffset, setCustomOffset] = useState("");
  const [saved, setSaved] = useState(item?.id ? item : null); // server response, drives the warning banner
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [justSaved, setJustSaved] = useState(false); // shows an explicit "Saved" confirmation so it's never ambiguous

  function update(field, value) {
    setJustSaved(false);
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

  function buildPayload() {
    return {
      title: form.title,
      amount: form.amount === "" ? null : Number(form.amount),
      deadline: form.deadline,
      categoryId: form.categoryId || null,
      description: form.description,
      reminderOffsets: form.reminderOffsets,
      cycleType: form.cycleType,
      customIntervalValue: form.cycleType === "CUSTOM" ? Number(form.customIntervalValue) : null,
      customIntervalUnit: form.cycleType === "CUSTOM" ? form.customIntervalUnit : null
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    setJustSaved(false);
    setSaving(true);
    try {
      const payload = buildPayload();

      const response = saved?.id
        ? await api.updateItem(saved.id, payload)
        : await api.createItem(payload);

      setSaved(response);
      onSaved(response);
      setJustSaved(true);

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

  function goToStep2(e) {
    e.preventDefault();
    if (!form.title.trim() || form.amount === "" || !form.deadline) {
      setFormError("Fill in the name, amount, and renewal date before continuing.");
      return;
    }
    setFormError("");
    setStep(2);
  }

  function goBackToStep1(e) {
    e.preventDefault();
    setFormError("");
    setStep(1);
  }

  async function handleDelete() {
    if (!saved?.id) return;
    if (!confirm(`Delete "${saved.title}"? This can't be undone.`)) return;
    await api.deleteItem(saved.id);
    onDeleted(saved.id);
    onClose();
  }

  async function handleMarkPaid() {
    if (!saved?.id) return;

    // Persist whatever's currently selected on screen FIRST. Without this,
    // clicking "Mark as paid" right after picking a new cycle (without
    // clicking Save first) would act on the old, already-saved cycle instead
    // of what's actually showing in the form.
    setMarkingPaid(true);
    setFormError("");
    let current;
    try {
      current = await api.updateItem(saved.id, buildPayload());
      setSaved(current);
    } catch (err) {
      setFormError(err.message || "Couldn't save your changes before marking this as paid.");
      setMarkingPaid(false);
      return;
    }

    const nextStepText = current.cycleType === "ONE_TIME"
      ? "It's a one-time item, so it'll be removed."
      : `It'll roll forward to its next due date (${current.cycleLabel}).`;

    if (!confirm(`Mark "${current.title}" as paid?\n\n${nextStepText}`)) {
      setMarkingPaid(false);
      onSaved(current); // the payload update above is real, so refresh the list behind the modal too
      return;
    }

    try {
      const result = await api.completeItem(current.id);
      onSaved(result.item);
      onClose();
    } catch (err) {
      setFormError(err.message || "Couldn't mark this item as paid.");
    } finally {
      setMarkingPaid(false);
    }
  }

  function applySuggestion(offset) {
    setForm((f) => ({ ...f, reminderOffsets: [...f.reminderOffsets, offset] }));
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>
            {isEdit ? "Edit renewal" : "Add renewal"}
            <span className="step-indicator"> · Step {step} of 2</span>
          </h2>
          <button className="close-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        {formError && <div className="form-error-banner">{formError}</div>}

        {step === 2 && justSaved && (
          <div className="success-banner">
            ✓ Saved — this now renews: <strong>{saved?.cycleLabel}</strong>
          </div>
        )}

        {step === 2 && saved?.warning && (
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

        <form onSubmit={step === 1 ? goToStep2 : handleSave}>
          {step === 1 && (
            <>
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
                  <button type="submit" className="btn btn-primary">Next</button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="field">
                <label>How often does this renew?</label>
                <div className="cycle-options">
                  {CYCLE_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      className={`cycle-option ${form.cycleType === opt.value ? "active" : ""}`}
                      onClick={() => update("cycleType", opt.value)}
                    >
                      <span className="cycle-option__label">{opt.label}</span>
                      <span className="cycle-option__hint">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.cycleType === "CUSTOM" && (
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="customValue">Every</label>
                    <input
                      id="customValue"
                      type="number"
                      min="1"
                      value={form.customIntervalValue}
                      onChange={(e) => update("customIntervalValue", e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="customUnit">Unit</label>
                    <select
                      id="customUnit"
                      value={form.customIntervalUnit}
                      onChange={(e) => update("customIntervalUnit", e.target.value)}
                    >
                      {INTERVAL_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="modal__footer">
                <div>
                  {isEdit && (
                    <button
                      type="button"
                      className="btn-text"
                      onClick={handleMarkPaid}
                      disabled={markingPaid}
                      style={{ padding: 0 }}
                    >
                      {markingPaid ? "Working..." : "✓ Mark as paid"}
                    </button>
                  )}
                </div>
                <div className="modal__footer-right">
                  <button type="button" className="btn btn-ghost" onClick={goBackToStep1}>Back</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}