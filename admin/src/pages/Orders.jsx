import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const STATUS_OPTIONS = [
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];



const formatItems = (items) => {
  if (!Array.isArray(items)) return "";
  return items
    .map((i) => {
      const size = i.size ? ` ${i.size}` : "";
      const q = i.quantity != null ? ` x ${i.quantity}` : "";
      return `${i.name || "Item"}${q}${size}`;
    })
    .join(", ");
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );
      if (data.success) setOrders(data.orders || []);
      else toast.error(data.message || "Failed to load orders");
    } catch (e) {
      console.error(e);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (orderId, status) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const nextStatus = status;

    try {
      console.log("[admin updateStatus] click", { orderId, nextStatus });

      // New API (PUT /api/orders/:id/status)
      const putRes = await axios.put(
        `${backendUrl}/api/orders/${orderId}/status`,
        { status: nextStatus },
        {
          headers: {
            token,
            "x-admin-override": "true",
          },
        }
      );


      console.log("[admin updateStatus] putRes", putRes?.data);

      if (putRes?.data?.success) {
        toast.success(putRes.data.message || "Updated");
        await load();
        return;
      }

      // Temporary fallback (legacy POST /api/order/status)
      const postRes = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: nextStatus },
        { headers: { token } }
      );
      console.log("[admin updateStatus] postRes", postRes?.data);

      if (postRes?.data?.success) {
        toast.success(postRes.data.message || "Updated");
        await load();
        return;
      }

      toast.error(postRes?.data?.message || putRes?.data?.message || "Update failed");
    } catch (e) {
      console.error("[admin updateStatus] error", e);
      toast.error(e?.response?.data?.message || "Update failed");
    }
  };




  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-4 text-lg font-medium text-gray-800">Order Page</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No orders yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => {
            const addr = order.address || {};
            const name =
              [addr.firstName, addr.lastName].filter(Boolean).join(" ") ||
              "Customer";
            const addrLines = [
              [addr.street, addr.city].filter(Boolean).join(", "),
              [addr.state, addr.zipcode].filter(Boolean).join(" "),
              addr.country,
              addr.phone ? `Phone: ${addr.phone}` : "",
            ]
              .filter(Boolean)
              .join("\n");

            return (
              <li
                key={order._id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-stretch sm:gap-6"
              >
                <div className="flex shrink-0 items-start justify-center text-3xl text-gray-400 sm:pt-1">
                  📦
                </div>
                <div className="min-w-0 flex-1 space-y-2 text-sm">
                  <p className="text-gray-800">{formatItems(order.items)}</p>
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-gray-500">
                    {addrLines}
                  </p>
                  <div className="grid gap-1 text-xs text-gray-600 sm:grid-cols-2">
                    <p>
                      Items :{" "}
                      {Array.isArray(order.items) ? order.items.length : 0}
                    </p>
                    <p>Method : {order.paymentMethod || "—"}</p>
                    <p>Payment : {order.payment ? "Paid" : "Pending"}</p>
                    <p>
                      Date :{" "}
                      {order.date
                        ? new Date(order.date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:justify-center">
                  <p className="text-xl font-bold text-gray-900">
                    ${order.amount}
                  </p>
                  <select
                    value={order.status || "Order Placed"}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-2 py-2 text-xs outline-none focus:border-gray-500 sm:min-w-[140px]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Orders;
