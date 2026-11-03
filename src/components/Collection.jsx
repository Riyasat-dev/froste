import { useState } from "react";
import { motion } from "framer-motion";
import products from "../data/products";
import ProductCard from "./ProductCard";

function Collection() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Jackets", "Coats", "Sweaters"];

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <section
      id="collection"
      className="bg-[#f5f3ef] px-6 py-24 md:px-16 md:py-32"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-[10px] tracking-[4px] text-[#8a3d45]">
              CURATED FOR THE SEASON
            </p>

            <h2 className="font-serif text-5xl text-[#292824] md:text-7xl">
              The Winter Edit
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-[#89857d]">
              Thoughtfully selected layers designed to make every cold day feel
              extraordinary.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 border-b border-[#dedbd3] pb-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-[10px] uppercase tracking-[1.5px] transition ${
                  activeCategory === category
                    ? "text-[#8a3d45]"
                    : "text-[#89857d] hover:text-[#292824]"
                }`}
              >
                {category}
                {activeCategory === category && (
                  <motion.div
                    layoutId="category-line"
                    className="mt-2 h-[1px] bg-[#8a3d45]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <a href="#/shop" className="border border-[#292824] px-10 py-4 text-[10px] tracking-[2px] text-[#292824] transition hover:bg-[#292824] hover:text-white">
            VIEW ALL PRODUCTS
          </a>
        </div>
      </div>
    </section>
  );
}

export default Collection;
