import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import { ShopContext } from "../context/ShopContext";
import menImg from "../assets/men.jpg";
import womenImg from "../assets/women.jpg";
import kidsImg from "../assets/kids.jpg";

const categories = [
  {
    title: "Men",
    image: menImg,
    path: "/collection/men",
  },
  {
    title: "Women",
    image: womenImg,
    path: "/collection/women",
  },
  {
    title: "Kids",
    image: kidsImg,
    path: "/collection/kids",
  },
];

const Collection = () => {
  const { products } = useContext(ShopContext);

  const trendingProducts = useMemo(
    () => products.filter((p) => p.bestseller).slice(0, 8),
    [products]
  );

  return (
    <div className="px-6 md:px-16 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold">COLLECTIONS</h1>
        <p className="text-gray-500 mt-2">
          Explore fashion categories & latest styles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {categories.map((item) => (
          <Link to={item.path} key={item.path}>
            <div className="relative overflow-hidden rounded-2xl group cursor-pointer shadow-md">
              <img
                src={item.image}
                alt={item.title}
                className="h-[500px] w-full object-cover group-hover:scale-110 transition duration-500"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h2 className="text-white text-5xl font-bold tracking-wide">
                  {item.title}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Trending Products</h2>
        {trendingProducts.length > 0 ? (
          <ProductGrid products={trendingProducts} />
        ) : (
          <p className="text-gray-500">No trending products yet.</p>
        )}
      </div>
    </div>
  );
};

export default Collection;
