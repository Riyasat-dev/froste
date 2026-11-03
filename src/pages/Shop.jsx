import { searchProducts } from "../data/products";
import ProductCard from "../components/ProductCard";

const FILTERS = {
  all: { title: "All Products", fn: () => true },
  new: { title: "New Arrivals", fn: (p) => p.badge === "NEW ARRIVAL" },
  women: { title: "Women", fn: (p) => p.gender === "women" },
  men: { title: "Men", fn: (p) => p.gender === "men" },
  sale: { title: "Sale", fn: (p) => Boolean(p.was) },
  accessories: { title: "Accessories", fn: () => false, empty: "Scarves, gloves and hats arrive soon." },
};
const CATEGORIES = ["Jackets", "Coats", "Sweaters"];

function Shop({ route }) {
  const key = FILTERS[route.filter] ? route.filter : "all";
  const f = FILTERS[key];
  const q = (route.query.q || "").trim();
  const cat = route.query.cat || "";

  const list = searchProducts(q).filter(f.fn).filter((p) => !cat || p.category === cat);

  const href = (nextCat) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextCat) params.set("cat", nextCat);
    const qs = params.toString();
    return `#/shop/${key}${qs ? `?${qs}` : ""}`;
  };

  return (
    <section className="bg-[#f5f3ef] px-6 pb-28 pt-14 md:px-16">
      <div className="mx-auto max-w-[1440px]">
        <nav aria-label="Breadcrumb" className="mb-8 text-[10px] tracking-[2px] text-[#89857D]">
          <a href="#home" className="hover:text-[#8a3d45]">HOME</a> / <span className="text-[#292824]">SHOP</span>
        </nav>

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-5xl text-[#292824] md:text-7xl">{q ? `Results for “${q}”` : f.title}</h1>
            <p className="mt-3 text-sm text-[#69665e]">{list.length} {list.length === 1 ? "piece" : "pieces"}</p>
          </div>

          <div className="flex flex-wrap gap-x-7 gap-y-3 border-b border-[#292824]/10 pb-3">
            {["", ...CATEGORIES].map((c) => (
              <a
                key={c || "all"}
                href={href(c)}
                aria-current={cat === c ? "true" : undefined}
                className={`pb-1 text-[10px] tracking-[2px] transition ${
                  cat === c ? "border-b border-[#8a3d45] text-[#8a3d45]" : "text-[#89857D] hover:text-[#292824]"
                }`}
              >
                {(c || "ALL").toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-serif text-2xl text-[#292824]">{f.empty || "Nothing found."}</p>
            <a href="#/shop" className="mt-8 inline-block border border-[#292824] px-8 py-3 text-[10px] tracking-[2px] text-[#292824] transition hover:bg-[#292824] hover:text-white">
              VIEW ALL PRODUCTS
            </a>
          </div>
        ) : (
          <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Shop;
