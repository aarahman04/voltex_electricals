const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// "₹18,500", or null when no price is set — callers render nothing for null.
export function formatPrice(value) {
  return Number.isFinite(value) && value > 0 ? inr.format(value) : null;
}
