import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";



export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  // ─── Config ───────────────────────────────────────────────────────────────
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const currency = "₹";
  const delivery_fee = 100;

  // ─── State ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(40);
const [couponCode, setCouponCode] = useState("");

  const navigate = useNavigate();

  // ─── Fetch Products from Backend ──────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    }
  };

  // ─── Cart: Add ────────────────────────────────────────────────────────────
  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product size");
      return;
    }

    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }
    setCartItems(cartData);

    // Sync to backend if logged in
    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/user/addtocart`,
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        console.error(error);
        toast.error("Failed to sync cart");
      }
    }
  };

  // ─── Cart: Update Quantity ────────────────────────────────────────────────
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/user/updatecart`,
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.error(error);
        toast.error("Failed to update cart");
      }
    }
  };

  // ─── Cart: Get from Backend (on login) ───────────────────────────────────
  const getUserCart = async (userToken) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/getcart`,
        {},
        { headers: { token: userToken } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch cart");
    }
  };

  // ─── Cart: Count ─────────────────────────────────────────────────────────
  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          totalCount += cartItems[itemId][size];
        }
      }
    }
    return totalCount;
  };

  // ─── Cart: Total Amount ───────────────────────────────────────────────────
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find((p) => p._id === itemId);
      if (!itemInfo) continue;
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          totalAmount += cartItems[itemId][size] * itemInfo.price;
        }
      }
    }
    return totalAmount;
  };

  // ─── Auth: Login ──────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/login`, {
        email,
        password,
      });
      if (response.data.success) {
        const userToken = response.data.token;
        setToken(userToken);
        localStorage.setItem("token", userToken);
        await getUserCart(userToken);
        navigate("/");
        toast.success("Logged in successfully!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    }
  };

  // ─── Auth: Register ───────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/register`, {
        name,
        email,
        password,
      });
      if (response.data.success) {
        const userToken = response.data.token;
        setToken(userToken);
        localStorage.setItem("token", userToken);
        navigate("/");
        toast.success("Account created!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
    }
  };
  
// ─── Google Login ─────────────────────────────
const googleLogin = async () => {
  try {

    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;

    const response = await axios.post(
      `${backendUrl}/api/user/google`,
      {
        name: user.displayName,
        email: user.email,
      }
    );

   if (response.data.success) {
  const userToken = response.data.token;

  setToken(userToken);
  localStorage.setItem("token", userToken);

  // ⭐ ADD THIS
  const userId = response.data.userId;
  localStorage.setItem("userId", userId);
}

  } catch (error) {
    console.log(error);
    toast.error("Google Login Failed");
  }
};



  // ─── Auth: Logout ─────────────────────────────────────────────────────────
  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setCartItems({});
    navigate("/login");
    toast.success("Logged out");
  };

  // ─── On Mount ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
  }, []);

  // Load cart from backend when token is available
  useEffect(() => {
    if (token) {
      getUserCart(token);
    }
  }, [token]);

  // ─── Context Value ────────────────────────────────────────────────────────
  const value = {
    // Data
    products,
    currency,
    delivery_fee,
    backendUrl,
    token,
    cartItems,

    // Cart
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    setCartItems,

    // Auth
    login,
    register,
    logout,
    setToken,

    // UI
    search,
    setSearch,
    showSearch,
    setShowSearch,
    navigate,
    googleLogin,
    fetchProducts,
    discount,
setDiscount,
couponCode,
shippingFee,
  setShippingFee,
setCouponCode,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;