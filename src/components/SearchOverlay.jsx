import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { searchProducts } from "../data/products";

function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => (q.trim() ? searchProducts(q).slice(0, 5) : []), [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const go = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    window.location.hash = `#/shop?q=${encodeURIComponent(q.trim())}`;
    onClose();
    setQ("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-[80] bg-[#f5f3ef]/98 px-6 pt-8 backdrop-blur-sm md:px-16"
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-end">
              <button onClick={onClose} aria-label="Close search" className="text-[#292824] transition hover:text-[#8a3d45]">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={go} className="mt-10 flex items-center gap-4 border-b border-[#292824]/30 pb-4">
              <Search size={22} strokeWidth={1.5} className="text-[#292824]" />
              <label htmlFor="site-search" className="sr-only">Search products</label>
              <input
                id="site-search"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search coats, puffers, knits…"
                className="w-full bg-transparent font-serif text-2xl text-[#292824] outline-none placeholder:text-[#292824]/35 md:text-4xl"
              />
            </form>

            <ul className="mt-8 divide-y divide-[#292824]/10">
              {results.map((p) => (
                <li key={p.id}>
                  <a
                    href={`#/product/${p.id}`}
                    onClick={() => { onClose(); setQ(""); }}
                    className="flex items-center justify-between py-5 transition hover:text-[#8a3d45]"
                  >
                    <span className="flex items-center gap-4">
                      <span className="h-10 w-10 border border-[#292824]/10" style={{ backgroundColor: p.colors[0].hex }} aria-hidden="true" />
                      <span className="font-serif text-xl text-[#292824]">{p.name}</span>
                    </span>
                    <span className="text-sm text-[#292824]">${p.price}</span>
                  </a>
                </li>
              ))}
            </ul>

            {q.trim() && results.length === 0 && (
              <p className="mt-8 text-sm text-[#69665e]">No pieces match “{q}”.</p>
            )}
            {results.length > 0 && (
              <button onClick={go} className="mt-6 text-[10px] tracking-[2.5px] text-[#8a3d45] hover:underline">
                VIEW ALL RESULTS →
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SearchOverlay;
