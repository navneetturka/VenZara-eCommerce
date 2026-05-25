import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

const emptySlots = () =>
  [0, 1, 2, 3].map(() => ({ file: null, preview: null }));

const Add = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState(emptySlots);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      slotsRef.current.forEach((s) => {
        if (s?.preview) URL.revokeObjectURL(s.preview);
      });
    };
  }, []);

  const onPickImage = (index, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setSlots((prev) => {
      const next = [...prev];
      if (next[index]?.preview) URL.revokeObjectURL(next[index].preview);
      next[index] = { file, preview: URL.createObjectURL(file) };
      return next;
    });
  };

  const toggleSize = (s) => {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const resetForm = () => {
    setSlots((prev) => {
      prev.forEach((s) => {
        if (s?.preview) URL.revokeObjectURL(s.preview);
      });
      return emptySlots();
    });
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Men");
    setSubCategory("Topwear");
    setBestseller(false);
    setSizes([]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in again");
      navigate("/login");
      return;
    }

    const files = slots.filter((s) => s.file);
    if (files.length === 0) {
      toast.error("Add at least one image");
      return;
    }
    if (sizes.length === 0) {
      toast.error("Select at least one size");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("category", category);
    formData.append("subCategory", subCategory);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("bestseller", String(bestseller));

    slots.forEach((s, i) => {
      if (s.file) formData.append(`image${i + 1}`, s.file);
    });

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        {
          headers: {
            token,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success("Product Added");
        resetForm();
        navigate("/list");
      } else {
        toast.error(data.message || "Could not add product");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not add product";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <form
        onSubmit={onSubmit}
        className="space-y-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <p className="mb-3 text-sm font-medium text-gray-800">Upload Image</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {slots.map((slot, index) => (
              <label
                key={index}
                className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-center hover:bg-gray-100"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickImage(index, e)}
                />
                {slot.preview ? (
                  <img
                    src={slot.preview}
                    alt=""
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <>
                    <span className="text-2xl text-gray-400">↑</span>
                    <span className="mt-1 text-xs text-gray-500">Upload</span>
                  </>
                )}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Product name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type here"
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Product description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write content here"
            rows={4}
            className="w-full resize-y rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Product category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            >
              <option>Men</option>
              <option>Women</option>
              <option>Kids</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Sub category
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            >
              <option>Topwear</option>
              <option>Bottomwear</option>
              <option>Winterwear</option>
              <option>Accessories</option>
              <option>Shoes</option>
              <option>Jewellery</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Product Price
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
              required
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-800">Product Sizes</p>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={[
                  "h-10 w-10 rounded border text-sm font-medium transition-colors",
                  sizes.includes(s)
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-800 hover:border-gray-400",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            checked={bestseller}
            onChange={(e) => setBestseller(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Add to bestseller
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-10 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-gray-900 disabled:opacity-60"
        >
          {submitting ? "Adding…" : "ADD"}
        </button>
      </form>
    </div>
  );
};

export default Add;
