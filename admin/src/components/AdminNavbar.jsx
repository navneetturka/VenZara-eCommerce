import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <h1 className="prata text-xl font-semibold tracking-wide text-black sm:text-2xl">
         Venzara<span className="text-[#d9468f]">.</span>
        </h1>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#d9468f] sm:text-xs">
          Admin Panel
        </p>
      </div>
      <button
        type="button"
        onClick={logout}
        className="rounded-lg bg-[#4b5563] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#374151]"
      >
        Logout
      </button>
    </header>
  );
};

export default AdminNavbar;
