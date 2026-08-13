import React from "react";

// Maps daysLeft to an urgency bucket, reused for the ring color and badges everywhere.
export function urgencyFor(daysLeft) {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 2) return "urgent";
  if (daysLeft <= 7) return "soon";
  return "upcoming";
}

const COLORS = {
  overdue: "#AE3B3B",
  urgent: "#B8721E",
  soon: "#1F6F5C",
  upcoming: "#8FAFA4"
};

// A small ring that fills in as the deadline approaches - a full ring means
// "renews today or overdue", an empty-ish ring means "plenty of runway".
// We treat a 30-day window as "full circle" for visual purposes.
export default function CountdownRing({ daysLeft, size = 56 }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const windowDays = 30;
  const clamped = Math.max(0, Math.min(windowDays, daysLeft));
  const fraction = daysLeft < 0 ? 1 : 1 - clamped / windowDays;
  const dash = Math.max(0.001, fraction) * circumference;

  const urgency = urgencyFor(daysLeft);
  const color = COLORS[urgency];

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E4EAE6"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="ring-label" style={{ color }}>
        <span className="num">{daysLeft < 0 ? Math.abs(daysLeft) : daysLeft}</span>
        <span className="unit">{daysLeft < 0 ? "over" : daysLeft === 1 ? "day" : "days"}</span>
      </div>
    </div>
  );
}
