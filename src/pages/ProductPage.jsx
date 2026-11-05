import { lazy, Suspense, useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import products, { getProduct } from "../data/products";
import ProductCard from "../components/ProductCard";
import { useStore } from "../store/useStore";

const HangingGarment = lazy(() => import("../components/HangingGarment"));

const SIZES = ["XS", "S", "M", "L", "XL"];
const COPY = {
  puffer: {
    text: "A lightweight quilted puffer built to keep the cold out without the bulk.",
    details: ["Quilted insulated construction", "Water-resistant outer shell", "Full-length front zip"],
  },
  coat: {
    text: "A long, double-breasted wool-blend coat with a clean notch lapel.",
    details: ["Wool-blend fabric", "Double-breasted front", "Tailored, slightly relaxed fit"],
  },
  hoodie: {
    text: "A relaxed, soft-touch hoodie made for layering under a coat or wearing on its own.",
    details: ["Soft brushed interior", "Relaxed everyday fit", "Drawstring hood"],
  },
  knit: {
    text: "A soft knit with ribbed cuffs and hem, made for easy layering.",
    details: ["Soft brushed knit", "Ribbed cuffs and hem", "Relaxed everyday fit"],
  },
};

function ProductPage({ id }) {
  const product = getProduct(id);
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [added, setAdded] = useState(false);

  const liked = useStore((s) => s.wishlist.includes(id));
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const openCart = useStore((s) => s.openCart);

  if (!product) {
    return (
      <section className="px-6 py-40 text-center">
        <p className="font-serif text-3xl text-[#292824]">We couldn’t find that piece.</p>
        <a href="#/shop" className="mt-8 inline-block border border-[#292824] px-8 py-3 text-[10px] tracking-[2px] text-[#292824]">
          BACK TO SHOP
        </a>
      </section>
    );
  }

  const color = product.colors[colorIdx];
  const copy = COPY[product.kind || product.type];
  const related = products
    .filter((p) => p.id !== id)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4);

  const handleAdd = () => {
    addToCart(product, color, size, qty);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <section className="bg-[#f5f3ef] px-6 pb-24 pt-12 md:px-16">
        <div className="mx-auto max-w-[1440px]">
          <nav aria-label="Breadcrumb" className="mb-8 text-[10px] tracking-[2px] text-[#89857D]">
            <a href="#home" className="hover:text-[#8a3d45]">HOME</a> /{" "}
            <a href="#/shop" className="hover:text-[#8a3d45]">SHOP</a> /{" "}
            <span className="text-[#292824]">{product.name.toUpperCase()}</span>
          </nav>

          <div className="grid gap-12 md:grid-cols-2 md:gap-20">
            <div
              role="img"
              aria-label={`${product.name} in ${color.name}. Hover or tap to straighten.`}
              tabIndex={0}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
              onPointerUp={(e) => e.pointerType !== "mouse" && setTapped((t) => !t)}
              onFocus={() => setHovered(true)}
              onBlur={() => setHovered(false)}
              className="relative aspect-[4/5] touch-pan-y bg-[#EAE6DE] outline-none md:sticky md:top-32 md:aspect-auto md:h-[calc(100vh-180px)] md:min-h-[520px]"
            >
              <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-[#292824]/[0.03]" />}>
                <HangingGarment
                  type={product.type}
                  color={color.hex}
                  tilt={product.tilt}
                  model={product.model}
                  seed={product.id * 1.7}
                  active={hovered || tapped}
                  enableControls={true}
                />
              </Suspense>
              <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-[9px] tracking-[3px] text-[#77736a]">
                DRAG TO ROTATE
              </p>
            </div>

            <div className="md:pt-6">
              {product.badge && <p className="mb-4 text-[10px] tracking-[3px] text-[#8a3d45]">{product.badge}</p>}
              <h1 className="font-serif text-4xl text-[#292824] md:text-6xl">{product.name}</h1>
              <p className="mt-5 text-lg text-[#292824]">
                {product.was && <s className="mr-3 text-[#89857D]">${product.was}</s>}${product.price}
              </p>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#69665e]">{copy.text}</p>

              <div className="mt-10">
                <p className="mb-3 text-[10px] tracking-[2.5px] text-[#292824]">
                  COLOUR — <span className="text-[#89857D]">{color.name.toUpperCase()}</span>
                </p>
                <div className="flex gap-3" role="radiogroup" aria-label="Colour">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      role="radio"
                      aria-checked={i === colorIdx}
                      aria-label={c.name}
                      onClick={() => setColorIdx(i)}
                      style={{ backgroundColor: c.hex }}
                      className={`h-8 w-8 rounded-full border transition ${
                        i === colorIdx
                          ? "border-[#292824] ring-1 ring-[#292824] ring-offset-2 ring-offset-[#F5F3EF]"
                          : "border-[#292824]/20 hover:border-[#292824]/60"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-3 text-[10px] tracking-[2.5px] text-[#292824]">SIZE</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      role="radio"
                      aria-checked={s === size}
                      onClick={() => setSize(s)}
                      className={`h-11 w-14 border text-xs transition ${
                        s === size
                          ? "border-[#292824] bg-[#292824] text-white"
                          : "border-[#292824]/25 text-[#292824] hover:border-[#292824]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-[#292824]/25">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="px-4 py-4 text-[#292824] hover:text-[#8a3d45]">
                    <Minus size={13} />
                  </button>
                  <span className="w-8 text-center text-sm text-[#292824]" aria-live="polite">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase quantity" className="px-4 py-4 text-[#292824] hover:text-[#8a3d45]">
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="min-w-[200px] flex-1 bg-[#292824] px-8 py-4 text-[11px] tracking-[2.5px] text-white transition hover:bg-[#8a3d45]"
                >
                  {added ? "ADDED ✓" : "ADD TO BAG"}
                </button>

                <button
                  onClick={() => toggleWishlist(id)}
                  aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={liked}
                  className="flex h-[54px] w-[54px] items-center justify-center border border-[#292824]/25 transition hover:bg-white"
                >
                  <Heart size={18} strokeWidth={1.4} fill={liked ? "#8A3D45" : "none"} color={liked ? "#8A3D45" : "#292824"} />
                </button>
              </div>

              <p className="mt-5 text-[10px] tracking-[2px] text-[#89857D]">COMPLIMENTARY SHIPPING ON ORDERS OVER $150</p>

              <ul className="mt-12 space-y-3 border-t border-[#292824]/10 pt-8 text-sm text-[#55534d]">
                {copy.details.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span className="mt-2 h-px w-4 shrink-0 bg-[#8a3d45]" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#ebe7df] px-6 py-24 md:px-16">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="mb-12 font-serif text-3xl text-[#292824] md:text-5xl">You may also like</h2>
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductPage;
