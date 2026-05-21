import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const locationData = {
  Punjab: {
    Rajpura: ["140401", "140402"],
    Patiala: ["147001", "147002"],
    Ludhiana: ["141001", "141002"],
    Amritsar: ["143001", "143002"],
  },
  Haryana: {
    Ambala: ["134001", "134002"],
    Kurukshetra: ["136118"],
    Panipat: ["132103"],
  },
  Delhi: {
    "New Delhi": ["110001", "110002"],
    Dwarka: ["110075"],
    Rohini: ["110085"],
  },
  Rajasthan: {
    Jaipur: ["302001", "302002"],
    Kota: ["324001"],
    Udaipur: ["313001"],
  },
  UttarPradesh: {
    Lucknow: ["226001", "226002"],
    Noida: ["201301", "201302"],
    Kanpur: ["208001"],
  },
  Maharashtra: {
    Mumbai: ["400001", "400002"],
    Pune: ["411001"],
    Nagpur: ["440001"],
  },
  Karnataka: {
    Bangalore: ["560001", "560002"],
    Mysore: ["570001"],
  },
  TamilNadu: {
    Chennai: ["600001", "600002"],
    Coimbatore: ["641001"],
  }
};

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    shippingFee,
    setShippingFee,
    products,
    discount,
    couponCode
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'India',
    phone: ''
  });

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [zipOptions, setZipOptions] = useState([]);

  // ───── SHIPPING LOGIC ─────
  const calculateShipping = (state, city = "") => {

    const nearbyStates = ["Punjab", "Haryana", "Delhi"];
    const mediumStates = ["Rajasthan", "UttarPradesh"];

    let fee = 120;

    if (nearbyStates.includes(state)) fee = 40;
    else if (mediumStates.includes(state)) fee = 70;

    if (state === "Punjab" && city === "Ludhiana") {
      fee = 30;
    }

    setShippingFee(fee);
  };

  // ───── HANDLERS ─────
  const handleStateChange = (e) => {
    const state = e.target.value;

    setSelectedState(state);
    setSelectedCity("");
    setZipOptions([]);

    setFormData(prev => ({
      ...prev,
      state,
      city: "",
      zipcode: ""
    }));

    calculateShipping(state, "");
  };

  const handleCityChange = (e) => {
    const city = e.target.value;

    setSelectedCity(city);

    const zips = locationData[selectedState]?.[city] || [];
    setZipOptions(zips);

    setFormData(prev => ({
      ...prev,
      city,
      zipcode: ""
    }));

    calculateShipping(selectedState, city);
  };

  const handleZipChange = (e) => {
    const zip = e.target.value;

    setFormData(prev => ({
      ...prev,
      zipcode: zip
    }));
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ───── ORDER ITEMS ─────
  const getOrderItems = () => {
    const orderItems = [];

    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          const productData = structuredClone(
            products.find(p => p._id === itemId)
          );

          if (productData) {
            productData.size = size;
            productData.quantity = cartItems[itemId][size];
            orderItems.push(productData);
          }
        }
      }
    }

    return orderItems;
  };

  // ───── SUBMIT ORDER ─────
  const onSubmitHandler = async (e) => {
    e.preventDefault();
     console.log("PLACE ORDER CLICKED");

    if (!token) {
      toast.error("Login required");
      navigate('/login');
      return;
    }

    const orderItems = getOrderItems();

    const orderData = {
      address: formData,
      items: orderItems,
      amount: getCartAmount() + shippingFee - discount,
      couponCode,
      discount
    };

    try {

      if (method === 'cod') {
  const res = await axios.post(
    `${backendUrl}/api/order/place`,
    orderData,
    { headers: { token } }
  );

  if (res.data.success) {
    setCartItems({});
    toast.success("Order placed");

    navigate(`/order-success/${res.data.orderId}`); // ⭐ FIXED
  }
}

      if (method === 'stripe') {
        const res = await axios.post(
          `${backendUrl}/api/order/stripe`,
          orderData,
          { headers: { token } }
        );

        if (res.data.success) {
          window.location.replace(res.data.session_url);
        }
      }

      if (method === 'razorpay') {
        const res = await axios.post(
          `${backendUrl}/api/order/razorpay`,
          orderData,
          { headers: { token } }
        );

        if (res.data.success) {
          const { order } = res.data;

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "NexCart",
            order_id: order.id,

            handler: async (response) => {
              const verify = await axios.post(
                `${backendUrl}/api/order/verifyRazorpay`,
                { razorpay_order_id: response.razorpay_order_id },
                { headers: { token } }
              );

              if (verify.data.success) {
                setCartItems({});
                toast.success("Payment successful");
                navigate('/orders');
              }
            },

            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              contact: formData.phone
            },

            theme: { color: "#000" }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }

    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
  <form
    onSubmit={onSubmitHandler}
    className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10"
  >

    {/* ───────── LEFT SIDE ───────── */}
    <div className="flex-1 bg-white p-6 rounded-xl border shadow-sm">

      <Title text1="DELIVERY" text2="INFORMATION" />

      <div className="grid grid-cols-1 gap-4 mt-6">

        <input
          name="firstName"
          onChange={onChangeHandler}
          placeholder="First Name"
          className="border p-3 rounded-md focus:outline-none focus:border-black"
        />

        <input
          name="lastName"
          onChange={onChangeHandler}
          placeholder="Last Name"
          className="border p-3 rounded-md focus:outline-none focus:border-black"
        />

        <input
          name="email"
          onChange={onChangeHandler}
          placeholder="Email"
          className="border p-3 rounded-md focus:outline-none focus:border-black"
        />

        <input
          name="street"
          onChange={onChangeHandler}
          placeholder="Street Address"
          className="border p-3 rounded-md focus:outline-none focus:border-black"
        />

        {/* STATE */}
        <select
          onChange={handleStateChange}
          className="border p-3 rounded-md"
        >
          <option>Select State</option>
          {Object.keys(locationData).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        {/* CITY */}
        <select
          onChange={handleCityChange}
          disabled={!selectedState}
          className="border p-3 rounded-md"
        >
          <option>Select City</option>
          {selectedState &&
            Object.keys(locationData[selectedState]).map((c) => (
              <option key={c}>{c}</option>
            ))}
        </select>

        {/* ZIP */}
        <select
          onChange={handleZipChange}
          disabled={!selectedCity}
          className="border p-3 rounded-md"
        >
          <option>Select Zip</option>
          {zipOptions.map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>

        <input
          name="phone"
          onChange={onChangeHandler}
          placeholder="Phone Number"
          className="border p-3 rounded-md"
        />
      </div>
    </div>

    {/* ───────── RIGHT SIDE ───────── */}
    <div className="w-full lg:w-[380px]">

      <div className="lg:sticky lg:top-6 space-y-6">

        {/* CART SUMMARY */}
        <div className="bg-white p-5 border rounded-xl shadow-sm">
          <CartTotal />
        </div>

        {/* PAYMENT */}
        <div className="bg-white p-5 border rounded-xl shadow-sm">

          <Title text1="PAYMENT" text2="METHOD" />

          <div className="flex flex-col gap-3 mt-4">

            <button
              type="button"
              onClick={() => setMethod("cod")}
              className={`p-3 border rounded-md transition ${
                method === "cod"
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              Cash on Delivery
            </button>

            <button
              type="button"
              onClick={() => setMethod("stripe")}
              className={`p-3 border rounded-md transition ${
                method === "stripe"
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              Stripe
            </button>

            <button
              type="button"
              onClick={() => setMethod("razorpay")}
              className={`p-3 border rounded-md transition ${
                method === "razorpay"
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              Razorpay
            </button>
          </div>
        </div>

        {/* PLACE ORDER BUTTON */}
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
        >
          PLACE ORDER
        </button>

      </div>
    </div>
  </form>
);
};

export default PlaceOrder;