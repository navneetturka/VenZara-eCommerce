export const STATUS_FLOW = [
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export const isAllowedStatus = (status) => STATUS_FLOW.includes(status);

export const getStatusIndex = (status) =>
  STATUS_FLOW.indexOf(status);

/**
 * Enforce forward-only status updates.
 * Allowed: moving from index i -> j where j > i.
 * Disallowed: backwards or same-level transitions.
 */
export const canTransition = ({ fromStatus, toStatus }) => {
  const fromIdx = getStatusIndex(fromStatus);
  const toIdx = getStatusIndex(toStatus);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx > fromIdx;
};

