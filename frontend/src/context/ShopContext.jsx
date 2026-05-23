import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API from "../utils/axios";
import { CURRENCY_SYMBOL } from "../constants/currency";


import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { getStorageJSON, setStorageJSON, removeStorageKey } from "../utils/storage";



export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  // ─── Config ───────────────────────────────────────────────────────────────
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const currency = CURRENCY_SYMBOL;
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
      const response = await API.get(`/product/list`);
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
    try {
      const response = await API.post("/user/addtocart", { itemId, size });
      if (response.data.success) {
        await getUserCart();
        toast.success("Added to cart");
      } else {
        toast.error(response.data.message || "Failed to add items to cart");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add items to cart");
    }
  };


  // ─── Cart: Update Quantity ────────────────────────────────────────────────
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await API.post(
          "/user/updatecart",
          { itemId, size, quantity }
        );

      } catch (error) {
        console.error(error);
        toast.error("Failed to update cart");
      }
    }
  };

  // ─── Cart: Get from Backend (on login) ───────────────────────────────────
  const getUserCart = async (authToken) => {
    const tokenToUse = authToken || localStorage.getItem("token");
    if (!tokenToUse) return;

    try {
      const response = await API.post(
        "/user/getcart",
        {},
        { headers: { token: tokenToUse } }
      );

      if (response?.data?.success) {
        setCartItems(response.data.cartData || {});
        return;
      }

      const message = response?.data?.message || "";
      console.warn("getUserCart: unexpected response", response?.data);

      if (
        message.toLowerCase().includes("user not found") ||
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("invalid user session")
      ) {
        localStorage.removeItem("token");
        setToken("");
        return;
      }

      toast.error(message || "Unable to fetch cart");
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setToken("");
        return;
      }
      toast.error("Unable to fetch cart");
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
      const response = await API.post("/user/login", {
        email,
        password,
      });
      if (response.data.success) {
        const userToken = response.data.token;
        localStorage.setItem("token", userToken);
        setToken(userToken);
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
      const response = await API.post("/user/register", {
        name,
        email,
        password,
      });
      if (response.data.success) {
        const userToken = response.data.token;
        localStorage.setItem("token", userToken);
        setToken(userToken);
        persistUser({ name, email, phone: "" });
        await getUserCart(userToken);
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

    const response = await API.post("/user/google", {
      name: user.displayName,
      email: user.email,
    });

    if (response.data.success) {
      const userToken = response.data.token;
      localStorage.setItem("token", userToken);
      setToken(userToken);
      persistUser({
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
      });
      await getUserCart(userToken);
      navigate("/");
      toast.success("Google Login Successful");
    } else {
      toast.error(response.data.message || "Google login failed");
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
    const stored = localStorage.getItem("token");
    if (token && stored === token) {
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