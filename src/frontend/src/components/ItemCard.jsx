import React from "react";
import CountdownRing from "./CountdownRing.jsx";

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

export default function ItemCard({ item, onClick }) {
  return (
    <div className="item-card" onClick={onClick}>
      <CountdownRing daysLeft={item.daysLeft} />
      <div className="item-card__body">
        <div className="item-card__top">
          <h3 className="item-card__title" title={item.title}>{item.title}</h3>
          <span className="item-card__amount">{currency.format(item.amount)}</span>
        </div>

        <div className="item-card__meta">
          {item.categoryName && (
            <span className="tag">{item.categoryIcon} {item.categoryName}</span>
          )}
          <span className="tag">{item.timeLeftLabel}</span>
        </div>

        {item.description && <p className="item-card__desc">{item.description}</p>}

        {item.warning && <div className="item-card__warning">⚠ {item.warning}</div>}
      </div>
    </div>
  );
}
