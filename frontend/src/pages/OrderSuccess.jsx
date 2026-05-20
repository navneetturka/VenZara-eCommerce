import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const OrderSuccess = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const { id } = useParams();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/order/${id}`,
          {
            headers: { token }
          }
        );

        setOrder(res.data.order);
      } catch (err) {
        console.log(err);
      }
    };

    fetchOrder();
  }, [id, backendUrl, token]);

  if (!order) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading your order...
      </p>
    );
  }

  const orderDate = new Date(order.date);
  const estimatedDate = new Date(orderDate);
  estimatedDate.setDate(orderDate.getDate() + 5);

  // 🔥 REAL STATUS FLOW (AMAZON STYLE)
  const statusFlow = ["Order Placed", "Processing", "Shipped", "Delivered"];

  const currentIndex = statusFlow.indexOf(order.status || "Order Placed");

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* HEADER */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-green-600">
          🎉 Order Placed Successfully
        </h1>

        <p className="text-gray-500 mt-1">
          Thank you for shopping with us
        </p>

        <p className="text-sm mt-2 text-gray-400">
          Order ID: {order._id}
        </p>
      </div>

      {/* TRACKING BAR */}
      <div className="mt-8">
        <h2 className="font-semibold mb-4">Order Status</h2>

        <div className="flex justify-between relative">

          {statusFlow.map((step, i) => {
            const isActive = i <= currentIndex;

            return (
              <div key={i} className="flex flex-col items-center flex-1 relative">

                {/* Circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs z-10
                  ${isActive ? "bg-green-600 text-white" : "bg-gray-300"}`}
                >
                  {isActive ? "✓" : ""}
                </div>

                {/* Label */}
                <p className="text-xs mt-2 text-center">{step}</p>

                {/* Line */}
                {i !== statusFlow.length - 1 && (
                  <div className="absolute top-3 left-1/2 w-full h-[2px] bg-gray-200"></div>
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* ITEMS */}
      <div className="mt-10 space-y-4">
        <h2 className="font-semibold">Items Ordered</h2>

        {order.items.map((item, i) => (
          <div key={i} className="flex gap-4 border p-4 rounded-lg">

            <img
              src={item.image?.[0] || "https://via.placeholder.com/80"}
              className="w-20 h-20 object-cover rounded"
            />

            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
              <p className="text-sm">
                Price: ₹{item.price}
              </p>

              {item.size && (
                <p className="text-sm text-gray-500">
                  Size: {item.size}
                </p>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* DELIVERY */}
      <div className="mt-8 border-t pt-4 text-sm text-gray-600">

        <h2 className="font-semibold mb-2">Delivery Details</h2>

        <p>{order.address.street}</p>
        <p>
          {order.address.city}, {order.address.state} - {order.address.zipcode}
        </p>
        <p>Phone: {order.address.phone}</p>

        <p className="mt-2">
          Estimated Delivery:{" "}
          <b>{estimatedDate.toDateString()}</b>
        </p>
      </div>

      {/* PAYMENT */}
      <div className="mt-6 border-t pt-4">
        <h2 className="font-semibold mb-2">Payment Summary</h2>

        <p>Payment Method: {order.paymentMethod}</p>
        <p>Total Amount: ₹{order.amount}</p>
      </div>

    </div>
  );
};

export default OrderSuccess;