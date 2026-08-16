# Renewal Reminder - Feature Flow Diagrams

## 1. Add Item Flow

```
┌─────────────┐
│  User Clicks│
│ "+ Add Item"│
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ ItemFormModal    │
│ Opens (New Mode) │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ User Enters:                         │
│ - Title                              │
│ - Amount                             │
│ - Deadline                           │
│ - Category                           │
│ - Cycle (ONE_TIME/MONTHLY/YEARLY)    │
│ - Reminders (days before deadline)   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────┐
│ Validates Input  │
└──────┬───────────┘
       │
       ├─ Invalid? ─────► Error Message
       │
       │ Valid
       ▼
┌──────────────────────────┐
│ POST /api/items          │
│ (Send item data)         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Backend Creates Item     │
│ - Assigns UUID           │
│ - Sets timestamps        │
│ - Stores in items.json   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Response with Item ID    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Frontend Refreshes List  │
│ Modal Closes             │
└──────────────────────────┘
```

---

## 2. Mark Item as Paid Flow

```
┌──────────────────────┐
│ User Clicks          │
│ "Mark as Paid" on    │
│ ItemCard             │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Confirmation Dialog      │
│ Shows Cycle Type & Next  │
│ Step Details             │
└──────┬───────────────────┘
       │
       ├─ User Cancels ──► Close Dialog
       │
       │ User Confirms
       ▼
┌──────────────────────────┐
│ POST /api/items/{id}     │
│ /complete                │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Backend Checks Cycle Type    │
└──────┬───────────────────────┘
       │
       ├─ ONE_TIME ──────┐
       │                 ▼
       │         ┌───────────────────┐
       │         │ Delete Item       │
       │         │ Return {deleted}  │
       │         └─────┬─────────────┘
       │               │
       │         ▼
       │ ┌────────────────────┐
       │ │ Item Removed from  │
       │ │ List               │
       │ └────────────────────┘
       │
       ├─ MONTHLY/YEARLY/CUSTOM ─┐
       │                          ▼
       │              ┌──────────────────────────┐
       │              │ Calculate Next Deadline  │
       │              │ Based on Cycle Type      │
       │              └──────┬───────────────────┘
       │                     │
       │                     ▼
       │              ┌──────────────────────────┐
       │              │ Update Item:             │
       │              │ - New deadline           │
       │              │ - lastCompletedDate      │
       │              │ - Keep cycle type        │
       │              │ Return {updated item}    │
       │              └──────┬───────────────────┘
       │                     │
       │              ▼
       │         ┌──────────────────┐
       │         │ Item Rolls Forward│
       │         │ Stays in List     │
       │         └──────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Frontend Refreshes List  │
│ Updated Deadline Shown   │
└──────────────────────────┘
```

---

## 3. Edit Item Flow

```
┌─────────────────┐
│ User Clicks on  │
│ ItemCard to Edit│
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│ ItemFormModal Opens  │
│ (Edit Mode)          │
│ Pre-fills All Fields │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User Modifies:       │
│ - Any field(s)       │
│ - Cycle type         │
│ - Reminders, etc.    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────┐
│ Validates Input  │
└──────┬───────────┘
       │
       ├─ Invalid? ──► Error Message
       │
       │ Valid
       ▼
┌──────────────────────────┐
│ PUT /api/items/{id}      │
│ (Send updated data)      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Backend Updates Item     │
│ - Applies all changes    │
│ - Updates timestamp      │
│ - Saves to items.json    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Response with Item       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Frontend Refreshes List  │
│ Modal Closes             │
└──────────────────────────┘
```

---

## 4. Notification & Reminder Flow

```
┌─────────────────────────────┐
│ App Loads / Every 60 seconds │
│ (Background Poll)            │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ GET /api/notifications   │
│ (Fetch upcoming reminders)
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Backend Identifies Items with    │
│ Reminders Firing Today/Soon      │
│ (deadline - reminderOffset days) │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Returns NotificationDto List:    │
│ - itemId                         │
│ - itemName                       │
│ - daysUntilDeadline              │
│ - reminderType                   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Frontend Checks:         │
│ - Notifications > 0?     │
└──────┬───────────────────┘
       │
       ├─ No Notifications ─► No action
       │
       │ Yes
       ▼
┌──────────────────────────────────┐
│ Check Browser Permission         │
└──────┬───────────────────────────┘
       │
       ├─ Permission Denied ──────► Skip
       │
       │ Permission Granted
       ▼
┌──────────────────────────────────┐
│ Show Browser Push Notification   │
│ "XYZ renewal due in N days"      │
│ + Bell Icon in UI                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ User Can:                        │
│ - Click Notification (open item) │
│ - View Bell Icon (see all)       │
│ - Dismiss (close)                │
└──────────────────────────────────┘
```

---

## 5. Category Management Flow

```
┌──────────────────────────┐
│ User Clicks Settings/    │
│ "Manage Categories"      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ CategoryManagerModal     │
│ Opens                    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ GET /api/categories      │
│ (Fetch all categories)   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Backend Returns List:    │
│ - id, name, icon        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ User Can:                    │
│ 1. Add New Category          │
│ 2. Edit Existing             │
│ 3. Delete Category           │
└──────┬──────────────────────┘
       │
       ├─ ADD ────────────────────┐
       │                          ▼
       │              ┌─────────────────────┐
       │              │ POST /api/categories│
       │              │ Send {name, icon}   │
       │              └────────┬────────────┘
       │                       ▼
       │              ┌────────────────────┐
       │              │ Backend Creates    │
       │              │ Category in DB     │
       │              └────────┬───────────┘
       │
       ├─ EDIT ───────────────────┐
       │                          ▼
       │              ┌─────────────────────┐
       │              │ PUT /api/categories │
       │              │ /{id}               │
       │              └────────┬────────────┘
       │                       ▼
       │              ┌────────────────────┐
       │              │ Backend Updates    │
       │              │ Category           │
       │              └────────┬───────────┘
       │
       ├─ DELETE ──────────────────┐
       │                           ▼
       │              ┌──────────────────────┐
       │              │ DELETE /api/         │
       │              │ categories/{id}      │
       │              └────────┬─────────────┘
       │                       ▼
       │              ┌──────────────────────┐
       │              │ Backend Removes      │
       │              │ Category             │
       │              │ Items retain ref but │
       │              │ category name hidden │
       │              └────────┬─────────────┘
       │
       ▼
┌──────────────────────────┐
│ Frontend Refreshes List  │
│ Modal Updates            │
└──────────────────────────┘
```

---

## Key Decision Points

| Flow | Decision | Outcome |
|------|----------|---------|
| Mark as Paid | Cycle Type? | ONE_TIME → Delete \| MONTHLY/YEARLY/CUSTOM → Roll Forward |
| Add/Edit Item | Valid Input? | Yes → Save \| No → Show Error |
| Notifications | Permission Granted? | Yes → Show Bell/Push \| No → Skip |
| Reminders | Days Until Deadline ≤ Reminder Offset? | Yes → Include in Notifications \| No → Exclude |

---

## Data Flow Summary

```
Frontend (React)
    ↓ API Call
Backend (Spring Boot)
    ↓ Validation & Logic
Item Service
    ↓ CRUD Operations
items.json (Persistent Store)
    ↓ Read/Updated Data
Backend Response
    ↓ JSON
Frontend Updates State & UI
```
