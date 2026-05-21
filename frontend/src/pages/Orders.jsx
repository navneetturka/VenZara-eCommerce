import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import ProfileLayout from "../components/ProfileLayout";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In Progress" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const TRACK_STEPS = [
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];


const formatOrderId = (id) => {
  if (!id) return "—";
  const tail = String(id).slice(-8).toUpperCase();
  return `VEN-${tail}`;
};

const getStatusLabel = (status) => {
  if (!status) return "In Progress";
  if (status === "Cancelled") return "Cancelled";
  if (status === "Delivered") return "Delivered";

  // Keep badge label aligned to backend flow labels
  if (TRACK_STEPS.includes(status)) return status;

  // Backward compatibility for legacy statuses
  if (status === "Order Placed") return "Processing";
  if (status === "Packing") return "Packed";
  if (status === "Out for delivery") return "Out for Delivery";

  return status;
};


const getStatusBadgeClass = (status) => {
  if (status === "Processing") return "bg-amber-50 text-amber-800 border-amber-200";
  if (status === "Packed") return "bg-amber-50 text-amber-800 border-amber-200";
  if (status === "Shipped") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "Out for Delivery") return "bg-gray-50 text-gray-700 border-gray-200";
  if (status === "Delivered") return "bg-green-50 text-green-700 border-green-200";
  if (status === "Cancelled") return "bg-red-50 text-red-700 border-red-200";
  return "bg-amber-50 text-amber-800 border-amber-200";
};


const getTrackIndex = (status) => {
  // Map backend flow to step indexes 0..4
  if (!status) return 0;
  if (status === "Cancelled") return 0;

  const normalized =
    status === "Out for delivery" ? "Out for Delivery" : status;

  const idx = TRACK_STEPS.indexOf(normalized);
  return idx === -1 ? 0 : idx;
};


const itemCount = (order) =>
  (order.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);

const firstImage = (order) => {
  const item = order.items?.[0];
  if (!item) return null;
  if (Array.isArray(item.image)) return item.image[0];
  return item.image || null;
};

const Orders = () => {
  const {
    backendUrl,
    token,
    currency,
    products,
    addToCart,
    addToWishlist,
    isInWishlist,
  } = useContext(ShopContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/order/`, {
        headers: { token },
      });
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = order.status || "Order Placed";
      if (filter === "all") return true;
      if (filter === "delivered") return status === "Delivered";
      if (filter === "cancelled") return status === "Cancelled";
      if (filter === "in_progress") {
        return status !== "Delivered" && status !== "Cancelled";
      }
      return true;
    });
  }, [orders, filter]);

  const openOrderDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/order/${orderId}`, {
        headers: { token },
      });
      if (response.data.success) {
        setSelectedOrder(response.data.order);
      } else {
        toast.error(response.data.message || "Could not load order");
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not load order details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/order/${orderId}`,
        { status: "Cancelled" },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order cancelled");
        setSelectedOrder(null);
        loadOrders();
      } else {
        toast.error(response.data.message || "Cancel failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Cancel failed");
    }
  };

  const handleReorder = async (order) => {
    const items = order.items || [];
    let added = 0;
    for (const item of items) {
      const productId = item.productId || item._id;
      const product =
        products.find((p) => String(p._id) === String(productId)) || item;
      const size = item.size || product.sizes?.[0];
      if (size) {
        await addToCart(product._id || productId, size);
        added += 1;
      }
    }
    if (added > 0) {
      toast.success("Items added to cart");
    } else {
      toast.error("Could not add items to cart");
    }
  };

  const handleMoveToWishlist = (order) => {
    const items = order.items || [];
    let count = 0;
    items.forEach((item) => {
      const productId = item.productId || item._id;
      const product = products.find((p) => String(p._id) === String(productId));
      const payload = product || {
        _id: productId,
        name: item.name,
        price: item.price,
        image: Array.isArray(item.image) ? item.image : [],
        sizes: item.size ? [item.size] : [],
      };
      if (!isInWishlist(payload._id)) {
        addToWishlist(payload);
        count += 1;
      }
    });
    if (count === 0 && items.length > 0) {
      toast.info("Items already in wishlist");
    }
  };

  const trackIndex = selectedOrder
    ? getTrackIndex(selectedOrder.status)
    : 0;



  return (
    <ProfileLayout active="orders">
      <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-5">
          My Orders
        </h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                filter === f.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 py-12 text-center">
            Loading your orders...
          </p>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-gray-600 mb-2">
              You haven&apos;t placed any orders yet
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {filter !== "all"
                ? "No orders match this filter."
                : "Explore our latest collections and find something you love."}
            </p>
            <Link
              to="/collection"
              className="inline-block bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => {
              const status = order.status || "Order Placed";
              const label = getStatusLabel(status);
              const img = firstImage(order);
              const count = itemCount(order);

              return (
                <button
                  key={order._id}
                  type="button"
                  onClick={() => openOrderDetail(order._id)}
                  className="w-full text-left flex items-center gap-4 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all bg-white"
                >
                  <div className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 bg-gray-100 rounded overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded border mb-2 ${getStatusBadgeClass(status)}`}
                    >
                      {label}
                    </span>
                    <p className="text-xs text-gray-500">
                      {order.date
                        ? new Date(order.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      Order ID: {formatOrderId(order._id)}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {count} {count === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                      {currency}
                      {order.amount}
                    </p>
                    <span className="text-gray-400 text-xl" aria-hidden>
                      ›
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {(selectedOrder || detailLoading) && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          onClick={() => !detailLoading && setSelectedOrder(null)}
        >
          <div
            className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-xl sm:rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading || !selectedOrder ? (
              <p className="p-8 text-center text-gray-500 text-sm">
                Loading order details...
              </p>
            ) : (
              <>
                <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">Order Details</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatOrderId(selectedOrder._id)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-black text-2xl leading-none px-2"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  <div>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${getStatusBadgeClass(selectedOrder.status)}`}
                    >
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-4">Order Tracking</h3>
                    <div className="flex justify-between relative px-2">
                      {TRACK_STEPS.map((step, i) => {
                        const active = i <= trackIndex;
                        return (
                          <div
                            key={step}
                            className="flex flex-col items-center flex-1 relative z-10"
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 ${
                                active
                                  ? "bg-black border-black text-white"
                                  : "bg-white border-gray-300 text-gray-400"
                              }`}
                            >
                              {active ? "✓" : i + 1}
                            </div>
                            <p className="text-[10px] sm:text-xs text-center mt-2 text-gray-600 max-w-[72px]">
                              {step}
                            </p>
                            {i < TRACK_STEPS.length - 1 && (
                              <div
                                className={`absolute top-3.5 left-[calc(50%+14px)] w-[calc(100%-28px)] h-0.5 ${
                                  i < trackIndex ? "bg-black" : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Products</h3>
                    <div className="space-y-3">
                      {(selectedOrder.items || []).map((item, idx) => {
                        const imgSrc = Array.isArray(item.image)
                          ? item.image[0]
                          : item.image;
                        return (
                          <div
                            key={idx}
                            className="flex gap-3 border border-gray-100 rounded-lg p-3"
                          >
                            {imgSrc && (
                              <img
                                src={imgSrc}
                                alt=""
                                className="w-16 h-20 object-cover rounded"
                              />
                            )}
                            <div className="text-sm">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-gray-500 mt-1">
                                {currency}
                                {item.price} · Qty {item.quantity}
                                {item.size ? ` · Size ${item.size}` : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedOrder.address && (
                    <div className="text-sm text-gray-600 border-t pt-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Shipping Address
                      </h3>
                      <p>
                        {selectedOrder.address.firstName}{" "}
                        {selectedOrder.address.lastName}
                      </p>
                      <p>{selectedOrder.address.street}</p>
                      <p>
                        {selectedOrder.address.city},{" "}
                        {selectedOrder.address.state} -{" "}
                        {selectedOrder.address.zipcode}
                      </p>
                      <p>{selectedOrder.address.country}</p>
                      {selectedOrder.address.phone && (
                        <p className="mt-1">
                          Phone: {selectedOrder.address.phone}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-sm border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Payment Summary
                    </h3>
                    <p className="text-gray-600">
                      Method: {selectedOrder.paymentMethod}
                    </p>
                    <p className="text-gray-600">
                      Payment:{" "}
                      {selectedOrder.payment ? "Paid" : "Pending"}
                    </p>
                    <p className="font-semibold text-gray-900 mt-2">
                      Total: {currency}
                      {selectedOrder.amount}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    {selectedOrder.status !== "Delivered" &&
                      selectedOrder.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(selectedOrder._id)}
                          className="border border-red-300 text-red-600 px-4 py-2 text-sm rounded hover:bg-red-50"
                        >
                          Cancel Order
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => handleReorder(selectedOrder)}
                      className="border border-gray-800 px-4 py-2 text-sm rounded hover:bg-gray-50"
                    >
                      Reorder
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveToWishlist(selectedOrder)}
                      className="border border-gray-300 px-4 py-2 text-sm rounded hover:bg-gray-50"
                    >
                      Move to Wishlist
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default Orders;
