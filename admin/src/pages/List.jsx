import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { formatPrice } from "../constants/currency";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const List = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/product/list`);
      if (data.success) setProducts(data.products || []);
      else toast.error(data.message || "Failed to load products");
    } catch (e) {
      console.error(e);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    if (!window.confirm("Remove this product?")) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message || "Removed");
        load();
      } else {
        toast.error(data.message || "Remove failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Remove failed");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-4 text-lg font-medium text-gray-800">
        All Products List
      </h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-500">Loading…</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100 text-gray-700">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No products yet.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={p.image?.[0]}
                        alt=""
                        className="h-14 w-11 rounded object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-700">{p.category}</td>
                    <td className="px-4 py-3 text-gray-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/edit/${p._id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(p._id)}
                          className="text-lg font-light text-gray-600 hover:text-red-600"
                          aria-label="Delete product"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default List;
