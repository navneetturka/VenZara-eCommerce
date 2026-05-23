import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import WishlistButton from "./WishlistButton";
import { getProductImageUrl } from "../utils/productImage";

const ProductItem = ({ id, image, name, price, sizes }) => {
  const { currency } = useContext(ShopContext);

  const product = { _id: id, name, price, image, sizes: sizes || [] };

  return (
    <div className="text-gray-700">
      <Link className="cursor-pointer block" to={`/product/${id}`}>
        <div className="overflow-hidden">
          <img
            className="hover:scale-110 transition ease-in-out w-full aspect-[4/5] object-cover"
            src={getProductImageUrl(image)}
            alt={name}
            loading="lazy"
          />
        </div>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="text-sm font-medium">
          {currency}
          {price}
        </p>
      </Link>
      <div className="mt-2">
        <WishlistButton product={product} className="w-full" />
      </div>
    </div>
  );
};

export default ProductItem;
