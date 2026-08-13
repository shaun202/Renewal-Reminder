import React from "react";
import ItemCard from "./ItemCard.jsx";

export default function ItemList({ items, onSelect }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h2>Nothing to renew yet</h2>
        <p>Add a subscription, license, or bill to start tracking its deadline.</p>
      </div>
    );
  }

  return (
    <div className="item-grid">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onClick={() => onSelect(item)} />
      ))}
    </div>
  );
}
