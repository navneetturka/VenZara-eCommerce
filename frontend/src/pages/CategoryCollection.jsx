import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";

const CategoryCollection = () => {

  const { category } = useParams();

  const { products, search } = useContext(ShopContext);

  const [filteredProducts, setFilteredProducts] = useState([]);

  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [selectedColor, setSelectedColor] = useState("");

  const [priceSort, setPriceSort] = useState("");

  useEffect(() => {

    let items = products.filter(
      (item) =>
        item.category.toLowerCase() === category.toLowerCase()
    );

    // SEARCH FILTER

    if (search) {

      items = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );

    }

    // SUBCATEGORY FILTER

    if (selectedSubCategory) {

      items = items.filter(
        (item) =>
          item.subCategory === selectedSubCategory
      );

    }

    // COLOR FILTER

    if (selectedColor) {

      items = items.filter(
        (item) =>
          item.color === selectedColor
      );

    }

    // PRICE SORTING

    if (priceSort === "low-high") {

      items.sort((a, b) => a.price - b.price);

    }

    if (priceSort === "high-low") {

      items.sort((a, b) => b.price - a.price);

    }

    setFilteredProducts(items);

  }, [
    products,
    category,
    search,
    selectedSubCategory,
    selectedColor,
    priceSort
  ]);

  return (

    <div className="flex gap-10 pt-10">

      {/* SIDEBAR */}

      <div className="w-[250px] border-r pr-5 hidden md:block">

        <h2 className="text-xl font-semibold mb-5">
          Filters
        </h2>

        {/* SUBCATEGORY */}

        <div className="mb-8">

          <p className="font-medium mb-3">
            Category
          </p>

          <div className="flex flex-col gap-2 text-gray-600">

            <button onClick={() => setSelectedSubCategory("")}>
              All
            </button>

            <button onClick={() => setSelectedSubCategory("Topwear")}>
              Topwear
            </button>

            <button onClick={() => setSelectedSubCategory("Bottomwear")}>
              Bottomwear
            </button>

            <button onClick={() => setSelectedSubCategory("Footwear")}>
              Footwear
            </button>

            <button onClick={() => setSelectedSubCategory("Accessories")}>
              Accessories
            </button>

          </div>

        </div>

        {/* COLOR */}

        <div className="mb-8">

          <p className="font-medium mb-3">
            Color
          </p>

          <div className="flex flex-col gap-2 text-gray-600">

            <button onClick={() => setSelectedColor("")}>
              All
            </button>

            <button onClick={() => setSelectedColor("Black")}>
              Black
            </button>

            <button onClick={() => setSelectedColor("White")}>
              White
            </button>

            <button onClick={() => setSelectedColor("Blue")}>
              Blue
            </button>

          </div>

        </div>

        {/* SORT */}

        <div>

          <p className="font-medium mb-3">
            Sort By Price
          </p>

          <select
            onChange={(e) => setPriceSort(e.target.value)}
            className="border p-2 w-full"
          >

            <option value="">
              Default
            </option>

            <option value="low-high">
              Low to High
            </option>

            <option value="high-low">
              High to Low
            </option>

          </select>

        </div>

      </div>

      {/* PRODUCTS */}

      <div className="flex-1">

        <h1 className="text-3xl font-semibold capitalize mb-8">
          {category} Collection
        </h1>

        {
          filteredProducts.length === 0 ? (

            <p>No products found.</p>

          ) : (

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

              {
                filteredProducts.map((item, index) => (

                  <ProductItem
                    key={index}
                    id={item._id}
                    image={item.image}
                    name={item.name}
                    price={item.price}
                    sizes={item.sizes}
                  />

                ))
              }

            </div>

          )
        }

      </div>

    </div>

  );
};

export default CategoryCollection;