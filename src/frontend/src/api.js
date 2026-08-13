const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
      else if (body.fields) {
        message = Object.values(body.fields).join(" · ");
      }
    } catch {
      // ignore - use default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Items
  getItems: () => request("/items"),
  createItem: (payload) => request("/items", { method: "POST", body: JSON.stringify(payload) }),
  updateItem: (id, payload) => request(`/items/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => request("/categories"),
  createCategory: (payload) => request("/categories", { method: "POST", body: JSON.stringify(payload) }),
  updateCategory: (id, payload) => request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  // Notifications
  getNotifications: () => request("/notifications")
};
