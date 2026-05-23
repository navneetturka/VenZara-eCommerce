import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

const emptySlots = () =>
  [0, 1, 2, 3].map(() => ({ file: null, preview: null, existingUrl: null }));

const Edit = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      slotsRef.current.forEach((s) => {
        if (s?.preview && s.preview.startsWith("blob:")) {
          URL.revokeObjectURL(s.preview);
        }
      });
    };
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.post(`${backendUrl}/api/product/single`, {
          productId: id,
        });

        if (!data.success || !data.product) {
          toast.error(data.message || "Product not found");
          navigate("/list");
          return;
        }

        const p = data.product;
        setName(p.name || "");
        setDescription(p.description || "");
        setPrice(String(p.price ?? ""));
        setCategory(p.category || "Men");
        setSubCategory(p.subCategory || "Topwear");
        setBestseller(Boolean(p.bestseller));
        setSizes(Array.isArray(p.sizes) ? p.sizes : []);

        const images = Array.isArray(p.image) ? p.image : [];
        setSlots(
          [0, 1, 2, 3].map((i) => ({
            file: null,
            preview: images[i] || null,
            existingUrl: images[i] || null,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
        navigate("/list");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProduct();
  }, [id, navigate]);

  const onPickImage = (index, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setSlots((prev) => {
      const next = [...prev];
      if (next[index]?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(next[index].preview);
      }
      next[index] = {
        file,
        preview: URL.createObjectURL(file),
        existingUrl: null,
      };
      return next;
    });
  };

  const clearSlot = (index) => {
    setSlots((prev) => {
      const next = [...prev];
      if (next[index]?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(next[index].preview);
      }
      next[index] = { file: null, preview: null, existingUrl: null };
      return next;
    });
  };

  const toggleSize = (s) => {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in again");
      navigate("/login");
      return;
    }

    const hasImage = slots.some((s) => s.file || s.existingUrl);
    if (!hasImage) {
      toast.error("Keep at least one image");
      return;
    }
    if (sizes.length === 0) {
      toast.error("Select at least one size");
      return;
    }

    const imageSlots = [];
    let uploadIndex = 1;

    slots.forEach((slot) => {
      if (slot.file) {
        imageSlots.push({ type: "new", index: uploadIndex });
        uploadIndex += 1;
      } else if (slot.existingUrl) {
        imageSlots.push({ type: "existing", url: slot.existingUrl });
      }
    });

    const formData = new FormData();
    formData.append("id", id);
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("category", category);
    formData.append("subCategory", subCategory);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("bestseller", String(bestseller));
    formData.append("imageSlots", JSON.stringify(imageSlots));

    let fileNum = 1;
    slots.forEach((slot) => {
      if (slot.file) {
        formData.append(`image${fileNum}`, slot.file);
        fileNum += 1;
      }
    });

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/product/update`,
        formData,
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Product Updated");
        navigate("/list");
      } else {
        toast.error(data.message || "Could not update product");
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      if (status === 404) {
        toast.error(
          "Update API not found. Restart the backend server (npm run dev in backend folder)."
        );
      } else if (status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(msg || "Could not update product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-sm text-gray-500 py-12">Loading product…</p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-800">Edit Product</h2>
        <Link
          to="/list"
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          ← Back to list
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <p className="mb-3 text-sm font-medium text-gray-800">
            Product Images
          </p>
          <p className="mb-3 text-xs text-gray-500">
            Click a slot to replace an image, or × to remove. At least one image
            is required.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {slots.map((slot, index) => (
              <div key={index} className="relative aspect-square">
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-center hover:bg-gray-100">
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
                {slot.preview && (
                  <button
                    type="button"
                    onClick={() => clearSlot(index)}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-black px-10 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-gray-900 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "SAVE CHANGES"}
          </button>
          <Link
            to="/list"
            className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Edit;
