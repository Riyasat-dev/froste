import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import {
  useStore,
  selectSubtotal,
  FREE_SHIPPING_OVER,
  SHIPPING_FEE,
} from "../store/useStore";

function CartDrawer() {
  const open = useStore((s) => s.cartOpen);
  const close = useStore((s) => s.closeCart);
  const cart = useStore((s) => s.cart);
  const subtotal = useStore(selectSubtotal);
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.removeFromCart);

  const shipping =
    cart.length === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const toFree = Math.max(0, FREE_SHIPPING_OVER - subtotal);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-[#292824]/40"
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-[#f5f3ef]"
          >
            <div className="flex items-center justify-between border-b border-[#292824]/10 px-6 py-6">
              <h2 className="font-serif text-2xl text-[#292824]">Your Bag</h2>
              <button
                onClick={close}
                aria-label="Close bag"
                className="text-[#292824] transition hover:text-[#8a3d45]"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="font-serif text-xl text-[#292824]">
                  Your bag is empty
                </p>
                <a
                  href="#collection"
                  onClick={close}
                  className="border border-[#292824] px-8 py-3 text-[10px] tracking-[2px] text-[#292824] transition hover:bg-[#292824] hover:text-white"
                >
                  EXPLORE THE EDIT
                </a>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-[#292824]/10 overflow-y-auto px-6">
                  {cart.map((item) => (
                    <li key={item.key} className="flex gap-4 py-6">
                      <span
                        className="mt-1 h-14 w-14 shrink-0 border border-[#292824]/10"
                        style={{ backgroundColor: item.hex }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <h3 className="font-serif text-base text-[#292824]">
                            {item.name}
                          </h3>
                          <span className="text-xs text-[#292824]">
                            ${item.price * item.qty}
                          </span>
                        </div>
                        <p className="mt-1 text-[9px] uppercase tracking-[2px] text-[#89857D]">
                          {item.color}
                          {item.size ? ` · ${item.size}` : ""}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border border-[#292824]/20">
                            <button
                              onClick={() => setQty(item.key, item.qty - 1)}
                              aria-label={`Decrease ${item.name} quantity`}
                              className="px-3 py-2 text-[#292824] transition hover:text-[#8a3d45]"
                            >
                              <Minus size={12} />
                            </button>
                            <span
                              className="w-6 text-center text-xs text-[#292824]"
                              aria-live="polite"
                            >
                              {item.qty}
                            </span>
                            <button
                              onClick={() => setQty(item.key, item.qty + 1)}
                              aria-label={`Increase ${item.name} quantity`}
                              className="px-3 py-2 text-[#292824] transition hover:text-[#8a3d45]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(item.key)}
                            className="text-[9px] uppercase tracking-[2px] text-[#89857D] underline-offset-4 transition hover:text-[#8a3d45] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#292824]/10 px-6 py-6">
                  {toFree > 0 && (
                    <p className="mb-4 text-[10px] tracking-[1.5px] text-[#8a3d45]">
                      ADD ${toFree} MORE FOR COMPLIMENTARY SHIPPING
                    </p>
                  )}
                  <dl className="space-y-2 text-xs text-[#55534d]">
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd>${subtotal}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Shipping</dt>
                      <dd>
                        {shipping === 0 ? "Complimentary" : `$${shipping}`}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-[#292824]/10 pt-3 text-sm text-[#292824]">
                      <dt>Total</dt>
                      <dd>${total}</dd>
                    </div>
                  </dl>
                  <a
                    href="#/checkout"
                    onClick={close}
                    className="mt-6 w-full bg-[#292824] py-4 text-[10px] tracking-[2.5px] text-white block text-center transition hover:bg-[#8a3d45]"
                  >
                    CHECKOUT
                  </a>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
