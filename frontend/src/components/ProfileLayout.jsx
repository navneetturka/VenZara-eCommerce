import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

const MENU = [
  { id: "profile", label: "My Profile", path: "/profile?section=profile" },
  { id: "orders", label: "My Orders", path: "/orders" },
  { id: "wishlist", label: "Wishlist", path: "/profile?section=wishlist" },
];

const ProfileLayout = ({ active, children }) => {
  const { user, logout } = useContext(ShopContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebar = (
    <aside className="w-full md:w-56 lg:w-64 shrink-0">
      <div className="border border-gray-200 bg-white rounded-lg p-5 shadow-sm">
        <div className="flex flex-col items-center text-center border-b border-gray-100 pb-5 mb-4">
          <img
            src={assets.profile_icon}
            alt=""
            className="w-14 h-14 rounded-full border border-gray-200 p-2.5 bg-gray-50 object-contain"
          />
          <p className="mt-3 text-sm font-medium text-gray-900">
            {user?.name || "Guest User"}
          </p>
          <p className="text-xs text-gray-500 mt-1 break-all px-1">
            {user?.email || ""}
          </p>
        </div>

        <nav className="flex flex-col gap-0.5">
          {MENU.map((item) => {
            const isActive = active === item.id;
            const className = `block px-3 py-2.5 text-sm transition-colors rounded ${
              isActive
                ? "font-medium text-black bg-gray-50 border-l-2 border-black -ml-[2px] pl-[10px]"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`;
            return (
              <Link key={item.id} to={item.path} className={className}>
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded mt-2"
          >
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );

  return (
    <div className="border-t pt-10 pb-16 min-h-[70vh]">
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden mb-4 border border-gray-300 px-4 py-2 text-sm w-full text-left rounded-lg bg-white"
      >
        {mobileMenuOpen ? "Hide Menu" : "Account Menu"}
      </button>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        <div className={`${mobileMenuOpen ? "block" : "hidden"} md:block`}>
          {sidebar}
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
};

export default ProfileLayout;
