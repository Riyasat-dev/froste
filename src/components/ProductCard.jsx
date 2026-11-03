import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useStore } from "../store/useStore";

// three.js is only downloaded when the first card scrolls into view
const HangingGarment = lazy(() => import("./HangingGarment"));

function ProductCard({ product }) {
  const [colorIdx, setColorIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [added, setAdded] = useState(false);

  const stageRef = useRef(null);
  const inView = useInView(stageRef, { once: true, margin: "200px" });

  const liked = useStore((s) => s.wishlist.includes(product.id));
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const openCart = useStore((s) => s.openCart);

  const color = product.colors[colorIdx];
  const active = hovered || tapped;

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(id);
  }, [added]);

  const handleAdd = () => {
    addToCart(product, color);
    setAdded(true);
    openCart();
  };

  const mouseOnly = (fn) => (e) => {
    if (e.pointerType === "mouse") fn();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7 }}
      className="group min-w-0"
    >
      <div className="relative isolate aspect-[4/5] overflow-hidden bg-[#EAE6DE]">
        <span className="pointer-events-none absolute bottom-3 left-5 font-serif text-[100px] leading-none text-[#292824]/[0.035]">
          0{product.id}
        </span>

        {product.badge && (
          <span className="absolute left-5 top-5 z-20 text-[9px] font-medium tracking-[2.5px] text-[#8A3D45]">
            {product.badge}
          </span>
        )}

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#292824]/10 bg-[#F5F3EF]/60 transition hover:bg-white"
        >
          <Heart
            size={16}
            strokeWidth={1.4}
            fill={liked ? "#8A3D45" : "none"}
            color={liked ? "#8A3D45" : "#292824"}
          />
        </button>

        {/* Hanging garment: hover (desktop) / tap (touch) / focus (keyboard) */}
        <div
          ref={stageRef}
          role="img"
          aria-label={`${product.name} in ${color.name}`}
          tabIndex={0}
          onPointerEnter={mouseOnly(() => setHovered(true))}
          onPointerLeave={mouseOnly(() => setHovered(false))}
          onPointerUp={(e) => {
            if (e.pointerType !== "mouse") setTapped((t) => !t);
          }}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          className="absolute inset-0 touch-pan-y outline-none"
        >
          {inView && (
            <Suspense
              fallback={<div className="absolute inset-0 animate-pulse bg-[#292824]/[0.03]" />}
            >
              <HangingGarment
                type={product.type}
                color={color.hex}
                tilt={product.tilt}
                model={product.model}
                seed={product.id * 1.7}
                active={active}
              />
            </Suspense>
          )}
        </div>

        {/* Quick Add: always visible on touch screens, slides up on hover/focus on desktop */}
        <div className="absolute bottom-0 left-0 z-20 w-full translate-y-full transition-transform duration-500 ease-out focus-within:translate-y-0 group-hover:translate-y-0 max-md:translate-y-0">
          <button
            onClick={handleAdd}
            className="flex w-full items-center justify-center gap-3 bg-[#292824] py-5 text-[9px] tracking-[2.5px] text-white transition-colors hover:bg-[#8A3D45]"
          >
            {added ? <Check size={15} strokeWidth={1.6} /> : <ShoppingBag size={15} strokeWidth={1.4} />}
            {added ? "ADDED TO BAG" : "QUICK ADD"}
          </button>
        </div>
      </div>

      <div className="border-b border-[#292824]/10 pb-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg tracking-[-0.3px] text-[#292824] md:text-xl"><a href={`#/product/${product.id}`} className="transition hover:text-[#8a3d45]">{product.name}</a></h3>
          <span className="shrink-0 pt-1 text-xs tracking-wide text-[#292824]">{product.was && <s className="mr-2 text-[#89857D]">${product.was}</s>}${product.price}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[9px] uppercase tracking-[2px] text-[#89857D]">{color.name}</p>
          <div className="flex gap-2" role="radiogroup" aria-label="Color">
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                role="radio"
                aria-checked={i === colorIdx}
                aria-label={c.name}
                onClick={() => setColorIdx(i)}
                style={{ backgroundColor: c.hex }}
                className={`h-4 w-4 rounded-full border transition ${
                  i === colorIdx
                    ? "border-[#292824] ring-1 ring-[#292824] ring-offset-2 ring-offset-[#F5F3EF]"
                    : "border-[#292824]/20 hover:border-[#292824]/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
