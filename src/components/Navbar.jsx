import { useState } from "react";
import { Menu, Search, ShoppingBag, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, selectCount } from "../store/useStore";
import SearchOverlay from "./SearchOverlay";

const links = [
  { label: "New Arrivals", href: "#/shop/new" },
  { label: "Women", href: "#/shop/women" },
  { label: "Men", href: "#/shop/men" },
  { label: "Accessories", href: "#/shop/accessories" },
  { label: "Sale", href: "#/shop/sale" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useStore(selectCount);
  const wishCount = useStore((s) => s.wishlist.length);
  const openCart = useStore((s) => s.openCart);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#f5f3ef]/95 backdrop-blur-md">
        <div className="bg-[#292824] py-2 text-center text-[10px] tracking-[2px] text-white sm:text-xs">
          COMPLIMENTARY SHIPPING ON ORDERS OVER $150
        </div>

        <nav className="relative mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#292824] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[11px] font-medium uppercase tracking-[1.5px] text-[#55534d] transition hover:text-[#8a3d45]"
              >
                {l.label}
              </a>
            ))}
          </div>

          <a
            href="#home"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-3xl font-semibold tracking-[5px] text-[#292824]"
          >
            FROSTÉ
          </a>

          <div className="ml-auto flex items-center gap-5 text-[#292824]">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="transition hover:text-[#8a3d45]"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <a
              href="#/wishlist"
              aria-label={`Wishlist, ${wishCount} saved`}
              className="relative transition hover:text-[#8a3d45]"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#292824] text-[9px] text-white">
                  {wishCount}
                </span>
              )}
            </a>
            <button
              aria-label={`Shopping bag, ${cartCount} items`}
              onClick={openCart}
              className="relative transition hover:text-[#8a3d45]"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#8a3d45] text-[9px] text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#dedbd3] bg-[#f5f3ef] md:hidden"
            >
              <div className="flex flex-col gap-5 px-6 py-7">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-xs uppercase tracking-[2px] text-[#55534d]"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Navbar;
