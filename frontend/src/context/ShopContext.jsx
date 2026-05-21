import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { getStorageJSON, setStorageJSON, removeStorageKey } from "../utils/storage";



export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  // ─── Config ───────────────────────────────────────────────────────────────
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const currency = "₹";
  const delivery_fee = 100;

  // ─── State ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState(
    () => getStorageJSON("cart", {}) || {}
  );
  const [wishlist, setWishlist] = useState(
    () => getStorageJSON("wishlist", []) || []
  );
  const [user, setUser] = useState(
    () => getStorageJSON("user", null)
  );
  const [addresses, setAddresses] = useState(
    () => getStorageJSON("addresses", []) || []
  );
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(40);
const [couponCode, setCouponCode] = useState("");

  const navigate = useNavigate();

  const persistUser = (userData) => {
    setUser(userData);
    setStorageJSON("user", userData);
  };

  const productSnapshot = (product) => ({
    _id: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
    sizes: product.sizes || [],
    category: product.category,
    subCategory: product.subCategory,
  });

  const isInWishlist = (productId) =>
    wishlist.some((item) => String(item._id) === String(productId));

  const addToWishlist = (product) => {
    if (!product?._id) return;
    if (isInWishlist(product._id)) {
      toast.info("Already in wishlist");
      return;
    }
    const next = [...wishlist, productSnapshot(product)];
    setWishlist(next);
    setStorageJSON("wishlist", next);
    toast.success("Added to wishlist");
  };

  const removeFromWishlist = (productId) => {
    const next = wishlist.filter(
      (item) => String(item._id) !== String(productId)
    );
    setWishlist(next);
    setStorageJSON("wishlist", next);
    toast.success("Removed from wishlist");
  };

  const toggleWishlist = (product) => {
    if (!product?._id) return;
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const moveWishlistToCart = async (productId) => {
    const item =
      wishlist.find((w) => String(w._id) === String(productId)) ||
      products.find((p) => String(p._id) === String(productId));

    if (!item) {
      toast.error("Product not found");
      return;
    }

    const size = item.sizes?.[0];
    if (!size) {
      toast.error("No size available for this product");
      return;
    }

    await addToCart(item._id, size);
    removeFromWishlist(item._id);
  };

  const updateUserProfile = (updates) => {
    const next = { ...(user || {}), ...updates };
    persistUser(next);
    toast.success("Profile updated");
  };

  const saveAddresses = (nextAddresses) => {
    setAddresses(nextAddresses);
    setStorageJSON("addresses", nextAddresses);
  };

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
        const existingUser = getStorageJSON("user", null);
        persistUser({
          name: existingUser?.name || email.split("@")[0],
          email,
          phone: existingUser?.phone || "",
        });
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
        persistUser({ name, email, phone: "" });
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
      persistUser({
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
      });
      const userId = response.data.userId;
      if (userId) localStorage.setItem("userId", userId);
      navigate("/");
      toast.success("Google Login Successful");
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
    localStorage.removeItem("userId");
    removeStorageKey("user");
    setUser(null);
    setCartItems({});
    setStorageJSON("cart", {});
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

  useEffect(() => {
    setStorageJSON("cart", cartItems);
  }, [cartItems]);

  useEffect(() => {
    setStorageJSON("wishlist", wishlist);
  }, [wishlist]);

  // ─── Context Value ────────────────────────────────────────────────────────
  const value = {
    // Data
    products,
    currency,
    delivery_fee,
    backendUrl,
    token,
    cartItems,
    wishlist,
    user,
    addresses,

    // Cart
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    setCartItems,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    moveWishlistToCart,
    updateUserProfile,
    saveAddresses,

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