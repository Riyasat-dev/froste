import products from "../data/products";
import ProductCard from "../components/ProductCard";
import { useStore } from "../store/useStore";

function Wishlist() {
  const wishlist = useStore((s) => s.wishlist);
  const list = products.filter((p) => wishlist.includes(p.id));

  return (
    <section className="min-h-[60vh] bg-[#f5f3ef] px-6 pb-28 pt-14 md:px-16">
      <div className="mx-auto max-w-[1440px]">
        <h1 className="font-serif text-5xl text-[#292824] md:text-7xl">Wishlist</h1>
        <p className="mt-3 text-sm text-[#69665e]">{list.length} saved</p>

        {list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-[#292824]">Nothing saved yet</p>
            <a href="#/shop" className="mt-8 inline-block border border-[#292824] px-8 py-3 text-[10px] tracking-[2px] text-[#292824] transition hover:bg-[#292824] hover:text-white">
              EXPLORE THE EDIT
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

export default Wishlist;
