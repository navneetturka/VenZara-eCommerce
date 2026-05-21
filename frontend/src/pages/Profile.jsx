import { useContext, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

const MENU = [
  { id: "profile", label: "My Profile" },
  { id: "orders", label: "My Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "addresses", label: "Addresses" },
];

const emptyAddress = {
  label: "Home",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  phone: "",
};

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = searchParams.get("section") || "profile";
  const [activeSection, setActiveSection] = useState(initialSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [orderData, setOrderData] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const {
    user,
    wishlist,
    currency,
    backendUrl,
    token,
    logout,
    updateUserProfile,
    addresses,
    saveAddresses,
    removeFromWishlist,
    moveWishlistToCart,
    products,
  } = useContext(ShopContext);

  useEffect(() => {
    const section = searchParams.get("section") || "profile";
    setActiveSection(section);
  }, [searchParams]);

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user]);

  const switchSection = (id) => {
    setActiveSection(id);
    setSearchParams({ section: id });
    setMobileMenuOpen(false);
  };

  const loadOrders = async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        const orders = response.data.orders || [];
        setOrderData(orders.reverse());
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "orders" && token) {
      loadOrders();
    }
  }, [activeSection, token]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    updateUserProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
    });
    setEditingProfile(false);
  };

  const resetAddressForm = () => {
    setAddressForm(emptyAddress);
    setEditingAddressId(null);
  };

  const handleAddressSave = (e) => {
    e.preventDefault();
    if (!addressForm.street.trim() || !addressForm.city.trim()) {
      toast.error("Street and city are required");
      return;
    }

    let next = [...addresses];
    if (editingAddressId) {
      next = next.map((addr) =>
        addr.id === editingAddressId ? { ...addr, ...addressForm } : addr
      );
      toast.success("Address updated");
    } else {
      next.push({
        id: `addr_${Date.now()}`,
        ...addressForm,
      });
      toast.success("Address added");
    }
    saveAddresses(next);
    resetAddressForm();
  };

  const handleAddressEdit = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label || "Home",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zipcode: addr.zipcode || "",
      country: addr.country || "",
      phone: addr.phone || "",
    });
  };

  const handleAddressDelete = (id) => {
    const next = addresses.filter((addr) => addr.id !== id);
    saveAddresses(next);
    if (editingAddressId === id) resetAddressForm();
    toast.success("Address removed");
  };

  const resolveWishlistItem = (item) => {
    const live = products.find((p) => String(p._id) === String(item._id));
    return live ? { ...live } : item;
  };

  const sidebar = (
    <aside className="w-full md:w-64 shrink-0 border border-gray-200 bg-white p-5">
      <div className="flex flex-col items-center text-center border-b border-gray-100 pb-5 mb-5">
        <img
          src={assets.profile_icon}
          alt=""
          className="w-16 h-16 rounded-full border border-gray-200 p-3 bg-gray-50 object-contain"
        />
        <p className="mt-3 font-medium text-gray-900">
          {user?.name || "Guest User"}
        </p>
        <p className="text-xs text-gray-500 mt-1 break-all">
          {user?.email || "No email saved"}
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => switchSection(item.id)}
            className={`text-left px-3 py-2.5 text-sm transition-colors ${
              activeSection === item.id
                ? "font-medium text-black border-l-2 border-black bg-gray-50"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={logout}
          className="text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 mt-2"
        >
          Logout
        </button>
      </nav>
    </aside>
  );

  const profileSection = (
    <div className="border border-gray-200 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">My Profile</h2>
        {!editingProfile && (
          <button
            type="button"
            onClick={() => setEditingProfile(true)}
            className="border border-gray-800 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Edit Profile
          </button>
        )}
      </div>

      {editingProfile ? (
        <form onSubmit={handleProfileSave} className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full border border-gray-300 px-3 py-2 mt-1 text-sm outline-none focus:border-gray-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full border border-gray-300 px-3 py-2 mt-1 text-sm outline-none focus:border-gray-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="w-full border border-gray-300 px-3 py-2 mt-1 text-sm outline-none focus:border-gray-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-black text-white px-5 py-2 text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingProfile(false);
                setProfileForm({
                  name: user?.name || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                });
              }}
              className="border border-gray-300 px-5 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-sm text-gray-700 max-w-md">
          <p>
            <span className="text-gray-500">Name:</span>{" "}
            {user?.name || "—"}
          </p>
          <p>
            <span className="text-gray-500">Email:</span>{" "}
            {user?.email || "—"}
          </p>
          <p>
            <span className="text-gray-500">Phone:</span>{" "}
            {user?.phone || "—"}
          </p>
        </div>
      )}
    </div>
  );

  const ordersSection = (
    <div className="border border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-medium mb-6">My Orders</h2>
      {ordersLoading ? (
        <p className="text-gray-500 text-sm">Loading your orders...</p>
      ) : orderData.length === 0 ? (
        <p className="text-gray-500 text-sm">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orderData.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 p-4 text-sm text-gray-700"
            >
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <p>
                  <span className="text-gray-500">Date:</span>{" "}
                  {order.date
                    ? new Date(order.date).toLocaleDateString()
                    : "—"}
                </p>
                <p>
                  <span className="text-gray-500">Status:</span> {order.status}
                </p>
                <p>
                  <span className="text-gray-500">Total:</span> {currency}
                  {order.amount}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    {item.image?.[0] && (
                      <img
                        src={item.image[0]}
                        alt=""
                        className="w-14 h-16 object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500 mt-1">
                        {currency}
                        {item.price} · Qty {item.quantity} · Size {item.size}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const wishlistSection = (
    <div className="border border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-medium mb-6">Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="text-gray-500 text-sm">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {wishlist.map((item) => {
            const product = resolveWishlistItem(item);
            return (
              <div key={item._id} className="text-gray-700">
                <Link to={`/product/${item._id}`}>
                  <div className="overflow-hidden">
                    <img
                      className="w-full hover:scale-110 transition ease-in-out"
                      src={product.image?.[0]}
                      alt={product.name}
                    />
                  </div>
                </Link>
                <p className="pt-3 pb-1 text-sm">{product.name}</p>
                <p className="text-sm font-medium mb-3">
                  {currency}
                  {product.price}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => moveWishlistToCart(item._id)}
                    className="bg-black text-white text-xs py-2 px-3"
                  >
                    Move to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item._id)}
                    className="border border-gray-300 text-xs py-2 px-3 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const addressesSection = (
    <div className="border border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-medium mb-6">Addresses</h2>

      <form
        onSubmit={handleAddressSave}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl"
      >
        <input
          placeholder="Label (e.g. Home)"
          value={addressForm.label}
          onChange={(e) =>
            setAddressForm((f) => ({ ...f, label: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <input
          placeholder="Phone"
          value={addressForm.phone}
          onChange={(e) =>
            setAddressForm((f) => ({ ...f, phone: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 sm:col-span-2"
        />
        <input
          placeholder="Street"
          value={addressForm.street}
          onChange={(e) =>
            setAddressForm((f) => ({ ...f, street: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 sm:col-span-2"
          required
        />
        <input
          placeholder="City"
          value={addressForm.city}
          onChange={(e) =>
            setAddressForm((f) => ({ ...f, city: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          required
        />
        <input
          placeholder="State"
          value={addressForm.state}
          onChange={(e) =>
            setAddressForm((f) => ({ ...f, state: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <input
          placeholder="Zipcode"
          value={addressForm.zipcode}
          onChange={(e) =>
            setAddressForm((f) => ({ ...f, zipcode: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <input
          placeholder="Country"
          value={addressForm.country}
          onChange={(e) =>
            setAddressForm((f) => ({ ...f, country: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <div className="sm:col-span-2 flex gap-3">
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 text-sm"
          >
            {editingAddressId ? "Update Address" : "Add Address"}
          </button>
          {editingAddressId && (
            <button
              type="button"
              onClick={resetAddressForm}
              className="border border-gray-300 px-5 py-2 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {addresses.length === 0 ? (
        <p className="text-gray-500 text-sm">No addresses saved yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-gray-200 p-4 text-sm text-gray-700 flex flex-col sm:flex-row sm:justify-between gap-3"
            >
              <div>
                <p className="font-medium">{addr.label || "Address"}</p>
                <p className="mt-1 text-gray-500">
                  {addr.street}, {addr.city}, {addr.state} {addr.zipcode}
                </p>
                <p className="text-gray-500">{addr.country}</p>
                {addr.phone && (
                  <p className="text-gray-500 mt-1">Phone: {addr.phone}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAddressEdit(addr)}
                  className="border border-gray-300 px-3 py-1.5 text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleAddressDelete(addr.id)}
                  className="border border-gray-300 px-3 py-1.5 text-xs text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const contentMap = {
    profile: profileSection,
    orders: ordersSection,
    wishlist: wishlistSection,
    addresses: addressesSection,
  };

  return (
    <div className="border-t pt-12 pb-16 min-h-[70vh]">
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden mb-4 border border-gray-300 px-4 py-2 text-sm w-full text-left"
      >
        {mobileMenuOpen ? "Hide Menu" : "Show Profile Menu"}
      </button>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className={`${mobileMenuOpen ? "block" : "hidden"} md:block`}>
          {sidebar}
        </div>
        <div className="flex-1 min-w-0 transition-opacity duration-200">
          {contentMap[activeSection] || profileSection}
        </div>
      </div>
    </div>
  );
};

export default Profile;
