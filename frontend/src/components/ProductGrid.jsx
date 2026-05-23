import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { getProductImageUrl } from "../utils/productImage";
import { ShopContext } from "../context/ShopContext";

const ProductGrid = ({ products }) => {
  const { currency } = useContext(ShopContext);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((item) => (
        <Link
          to={item._id ? `/product/${item._id}` : "#"}
          key={item._id || item.name}
          className="cursor-pointer block"
        >
          <img
            src={getProductImageUrl(item.image)}
            alt={item.name}
            className="h-[320px] w-full object-cover rounded-lg"
            loading="lazy"
          />

          <h3 className="mt-2 text-sm md:text-base">
            {item.name}
          </h3>

          <p className="font-semibold">
            {currency}{item.price}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;