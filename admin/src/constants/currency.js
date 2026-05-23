export const CURRENCY_SYMBOL = "₹";

export const formatPrice = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${CURRENCY_SYMBOL}0`;
  return `${CURRENCY_SYMBOL}${value}`;
};
