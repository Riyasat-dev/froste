import { useState } from "react";
import {
  useStore,
  selectSubtotal,
  FREE_SHIPPING_OVER,
  SHIPPING_FEE,
} from "../store/useStore";

const COUNTRIES = ["Pakistan", "United Arab Emirates", "United Kingdom", "United States", "Canada", "Germany"];
const EMPTY = { email: "", name: "", address: "", city: "", postal: "", country: "Pakistan", payment: "cod" };

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[10px] tracking-[2px] text-[#292824]">{label}</label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-[#8a3d45]">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-[#292824]/25 bg-transparent px-4 py-3.5 text-sm text-[#292824] outline-none transition focus:border-[#292824]";

function Checkout() {
  const cart = useStore((s) => s.cart);
  const subtotal = useStore(selectSubtotal);
  const clearCart = useStore((s) => s.clearCart);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null);

  const shipping = subtotal >= FREE_SHIPPING_OVER || cart.length === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email address.";
    if (!form.name.trim()) err.name = "Enter your full name.";
    if (!form.address.trim()) err.address = "Enter your address.";
    if (!form.city.trim()) err.city = "Enter your city.";
    if (!form.postal.trim()) err.postal = "Enter your postal code.";
    setErrors(err);
    if (Object.keys(err).length) return;

    // Demo only: nothing is sent anywhere.
    setOrder({ id: `FR-${Math.floor(100000 + Math.random() * 900000)}`, total, email: form.email });
    clearCart();
  };

  if (order) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-[#f5f3ef] px-6 py-24 text-center">
        <div className="max-w-lg">
          <p className="mb-5 text-[10px] tracking-[4px] text-[#8a3d45]">ORDER PLACED</p>
          <h1 className="font-serif text-5xl text-[#292824]">Thank you.</h1>
          <p className="mt-6 text-sm leading-7 text-[#69665e]">
            Order <strong className="text-[#292824]">{order.id}</strong> for ${order.total} is confirmed.
            A confirmation would be sent to {order.email}. This is a demo store, so nothing was charged or shipped.
          </p>
          <a href="#home" className="mt-10 inline-block bg-[#292824] px-9 py-4 text-[11px] tracking-[2.5px] text-white transition hover:bg-[#8a3d45]">
            CONTINUE SHOPPING
          </a>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f5f3ef] px-6 text-center">
        <h1 className="font-serif text-4xl text-[#292824]">Your bag is empty</h1>
        <a href="#/shop" className="mt-8 border border-[#292824] px-9 py-4 text-[10px] tracking-[2.5px] text-[#292824] transition hover:bg-[#292824] hover:text-white">
          EXPLORE THE EDIT
        </a>
      </section>
    );
  }

  return (
    <section className="bg-[#f5f3ef] px-6 pb-28 pt-14 md:px-16">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="font-serif text-5xl text-[#292824] md:text-6xl">Checkout</h1>

        <div className="mt-12 grid gap-14 md:grid-cols-[1.3fr_1fr]">
          <form onSubmit={submit} noValidate className="space-y-10">
            <fieldset className="space-y-5">
              <legend className="mb-5 font-serif text-2xl text-[#292824]">Contact</legend>
              <Field id="email" label="EMAIL" error={errors.email}>
                <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} className={inputCls} />
              </Field>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="mb-5 font-serif text-2xl text-[#292824]">Shipping</legend>
              <Field id="name" label="FULL NAME" error={errors.name}>
                <input id="name" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} className={inputCls} />
              </Field>
              <Field id="address" label="ADDRESS" error={errors.address}>
                <input id="address" autoComplete="street-address" value={form.address} onChange={set("address")} aria-invalid={!!errors.address} className={inputCls} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="city" label="CITY" error={errors.city}>
                  <input id="city" autoComplete="address-level2" value={form.city} onChange={set("city")} aria-invalid={!!errors.city} className={inputCls} />
                </Field>
                <Field id="postal" label="POSTAL CODE" error={errors.postal}>
                  <input id="postal" autoComplete="postal-code" value={form.postal} onChange={set("postal")} aria-invalid={!!errors.postal} className={inputCls} />
                </Field>
              </div>
              <Field id="country" label="COUNTRY">
                <select id="country" autoComplete="country-name" value={form.country} onChange={set("country")} className={inputCls}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </fieldset>

            <fieldset>
              <legend className="mb-5 font-serif text-2xl text-[#292824]">Payment</legend>
              <div className="space-y-3">
                {[
                  ["cod", "Cash on delivery"],
                  ["card", "Card (coming soon: needs a payment provider)"],
                ].map(([val, label]) => (
                  <label key={val} className={`flex items-center gap-3 border px-4 py-4 text-sm text-[#292824] ${form.payment === val ? "border-[#292824]" : "border-[#292824]/20"} ${val === "card" ? "opacity-50" : "cursor-pointer"}`}>
                    <input type="radio" name="payment" value={val} checked={form.payment === val} disabled={val === "card"} onChange={set("payment")} className="accent-[#8a3d45]" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button type="submit" className="w-full bg-[#292824] py-5 text-[11px] tracking-[2.5px] text-white transition hover:bg-[#8a3d45]">
              PLACE ORDER · ${total}
            </button>
            <p className="text-center text-[10px] tracking-[1.5px] text-[#89857D]">DEMO STORE: NO PAYMENT IS TAKEN AND NOTHING IS SAVED</p>
          </form>

          <aside className="h-fit border border-[#292824]/10 bg-[#ebe7df] p-7 md:sticky md:top-32">
            <h2 className="mb-6 font-serif text-2xl text-[#292824]">Order summary</h2>
            <ul className="divide-y divide-[#292824]/10">
              {cart.map((i) => (
                <li key={i.key} className="flex gap-4 py-4">
                  <span className="h-12 w-12 shrink-0 border border-[#292824]/10" style={{ backgroundColor: i.hex }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[#292824]">{i.name}</p>
                    <p className="text-[10px] uppercase tracking-[1.5px] text-[#89857D]">
                      {i.color}{i.size ? ` · ${i.size}` : ""} · QTY {i.qty}
                    </p>
                  </div>
                  <span className="text-sm text-[#292824]">${i.price * i.qty}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-[#292824]/10 pt-4 text-sm text-[#55534d]">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>${subtotal}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Complimentary" : `$${shipping}`}</dd></div>
              <div className="flex justify-between pt-2 text-base text-[#292824]"><dt>Total</dt><dd>${total}</dd></div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
