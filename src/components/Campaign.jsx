import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import products from "../data/products";
import { useStore } from "../store/useStore";

// three.js loads only when this section is close to the viewport
const GarmentRail = lazy(() => import("./GarmentRail"));

function Campaign() {
  const sectionRef = useRef(null);
  const wrapRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "200px" });

  const scrollRef = useRef(0); // target scroll, in 3D units (read by the rail every frame)
  const metaRef = useRef({ viewW: 6, maxScroll: 0 });
  const drag = useRef(null);

  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [colorSel, setColorSel] = useState({});

  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const openCart = useStore((s) => s.openCart);

  const items = products.map((p) => ({ ...p, hex: p.colors[colorSel[p.id] || 0].hex }));
  const activeIdx = hovered ?? pinned;
  const active = activeIdx == null ? null : items[activeIdx];
  const activeColor = active ? active.colors[colorSel[active.id] || 0] : null;

  const clamp = (v) => Math.min(Math.max(v, 0), metaRef.current.maxScroll);
  const scrollBy = (units) => {
    scrollRef.current = clamp(scrollRef.current + units);
  };

  // drag to scroll (mouse + touch). Vertical page scroll stays native (touch-pan-y).
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, start: scrollRef.current };
    const move = (ev) => {
      if (!drag.current || !wrapRef.current) return;
      const unitsPerPx = metaRef.current.viewW / wrapRef.current.clientWidth;
      scrollRef.current = clamp(drag.current.start - (ev.clientX - drag.current.x) * unitsPerPx);
    };
    const up = () => {
      drag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // horizontal trackpad / shift+wheel (native listener so we can preventDefault)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e) => {
      const dx = e.shiftKey ? e.deltaY : e.deltaX;
      if (Math.abs(dx) > Math.abs(e.shiftKey ? 0 : e.deltaY)) {
        e.preventDefault();
        scrollBy(dx * 0.006);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") scrollBy(1.15);
    if (e.key === "ArrowLeft") scrollBy(-1.15);
  };

  const handleAdd = () => {
    addToCart(active, activeColor);
    openCart();
  };

  return (
    <section id="campaign" ref={sectionRef} className="overflow-hidden bg-[#ebe7df] px-6 py-20 md:px-16 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-5 text-[10px] tracking-[4px] text-[#8a3d45]">THE WINTER CAMPAIGN</p>
            <h2 className="font-serif text-5xl leading-[1.05] text-[#292824] md:text-7xl">
              Layers for the longest nights.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#69665e]">
              Step into the closet. Drag to browse the rail, then pull any piece forward.
            </p>
          </motion.div>

          <div className="flex gap-3">
            <button
              onClick={() => scrollBy(-3.45)}
              aria-label="Scroll rail left"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#292824]/25 text-[#292824] transition hover:bg-[#292824] hover:text-white"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scrollBy(3.45)}
              aria-label="Scroll rail right"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#292824]/25 text-[#292824] transition hover:bg-[#292824] hover:text-white"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div
          ref={wrapRef}
          role="region"
          aria-label="Winter campaign clothing rail. Use left and right arrow keys to scroll."
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          className="relative mt-10 h-[560px] cursor-grab touch-pan-y select-none outline-none active:cursor-grabbing"
        >
          {inView && (
            <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-[#292824]/[0.03]" />}>
              <GarmentRail
                items={items}
                activeIdx={activeIdx}
                onHover={setHovered}
                onPick={(i) => setPinned((p) => (p === i ? null : i))}
                onMiss={() => setPinned(null)}
                scrollRef={scrollRef}
                metaRef={metaRef}
              />
            </Suspense>
          )}

          {/* details of the piece that was pulled forward */}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="pointer-events-auto flex w-full max-w-xl flex-col gap-4 bg-[#f5f3ef] p-5 shadow-[0_10px_40px_rgba(41,40,36,0.12)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-[9px] tracking-[2.5px] text-[#8a3d45]">{active.badge || active.category.toUpperCase()}</p>
                    <h3 className="mt-1 font-serif text-xl text-[#292824]">{active.name}</h3>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs text-[#292824]">${active.price}</span>
                      <div className="flex gap-2" role="radiogroup" aria-label="Color">
                        {active.colors.map((col, i) => (
                          <button
                            key={col.name}
                            role="radio"
                            aria-checked={(colorSel[active.id] || 0) === i}
                            aria-label={col.name}
                            onClick={() => setColorSel((s) => ({ ...s, [active.id]: i }))}
                            style={{ backgroundColor: col.hex }}
                            className={`h-4 w-4 rounded-full border transition ${
                              (colorSel[active.id] || 0) === i
                                ? "border-[#292824] ring-1 ring-[#292824] ring-offset-2 ring-offset-[#f5f3ef]"
                                : "border-[#292824]/20 hover:border-[#292824]/60"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] uppercase tracking-[2px] text-[#89857D]">{activeColor.name}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      onClick={() => toggleWishlist(active.id)}
                      aria-label={wishlist.includes(active.id) ? "Remove from wishlist" : "Add to wishlist"}
                      aria-pressed={wishlist.includes(active.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#292824]/15 transition hover:bg-white"
                    >
                      <Heart
                        size={16}
                        strokeWidth={1.4}
                        fill={wishlist.includes(active.id) ? "#8A3D45" : "none"}
                        color={wishlist.includes(active.id) ? "#8A3D45" : "#292824"}
                      />
                    </button>
                    <button
                      onClick={handleAdd}
                      className="bg-[#292824] px-7 py-3.5 text-[10px] tracking-[2.5px] text-white transition hover:bg-[#8a3d45]"
                    >
                      QUICK ADD
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pb-4 text-[10px] tracking-[3px] text-[#77736a]"
                >
                  DRAG TO BROWSE · HOVER OR TAP A PIECE
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* keyboard / screen-reader access to the 3D rail */}
        <ul className="sr-only">
          {items.map((p, i) => (
            <li key={p.id}>
              <button onClick={() => setPinned((x) => (x === i ? null : i))}>
                {p.name}, ${p.price}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Campaign;
