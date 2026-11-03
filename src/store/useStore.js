import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_QTY = 10;

export const useStore = create(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      cartOpen: false,

      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),

      addToCart: (product, color, size = "M", qty = 1) =>
        set((s) => {
          const key = `${product.id}:${color.name}:${size}`;
          const exists = s.cart.some((i) => i.key === key);
          const cart = exists
            ? s.cart.map((i) =>
                i.key === key ? { ...i, qty: Math.min(i.qty + qty, MAX_QTY) } : i,
              )
            : [
                ...s.cart,
                {
                  key,
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  color: color.name,
                  hex: color.hex,
                  size,
                  qty: Math.min(qty, MAX_QTY),
                },
              ];
          return { cart };
        }),

      setQty: (key, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((i) => i.key !== key)
              : s.cart.map((i) =>
                  i.key === key ? { ...i, qty: Math.min(qty, MAX_QTY) } : i,
                ),
        })),

      removeFromCart: (key) =>
        set((s) => ({ cart: s.cart.filter((i) => i.key !== key) })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((x) => x !== id)
            : [...s.wishlist, id],
        })),
    }),
    {
      name: "froste-store",
      partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist }),
    },
  ),
);

export const selectCount = (s) => s.cart.reduce((n, i) => n + i.qty, 0);
export const selectSubtotal = (s) =>
  s.cart.reduce((n, i) => n + i.price * i.qty, 0);

export const FREE_SHIPPING_OVER = 150;
export const SHIPPING_FEE = 15;
