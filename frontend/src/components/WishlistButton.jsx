import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const WishlistButton = ({ product, className = "" }) => {
  const { isInWishlist, toggleWishlist } = useContext(ShopContext);

  if (!product?._id) return null;

  const inWishlist = isInWishlist(product._id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-xs sm:text-sm border border-gray-300 px-3 py-1.5 hover:bg-gray-50 transition-colors ${className}`}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist ❤️"}
    </button>
  );
};

export default WishlistButton;
