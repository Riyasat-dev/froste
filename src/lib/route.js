import { useEffect, useMemo, useState } from "react";

// Tiny hash router. "#/product/3", "#/shop/women?cat=Coats", "#/checkout".
// Anything that does not start with "#/" (like "#collection") is a section anchor on the home page.
export function parseHash(hash) {
  const h = (hash || "").replace(/^#/, "");
  if (!h.startsWith("/")) return { name: "home", anchor: h };
  const [path, qs = ""] = h.slice(1).split("?");
  const [first, second] = path.split("/").filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(qs));
  if (first === "product") return { name: "product", id: Number(second), query };
  if (first === "shop") return { name: "shop", filter: second || "all", query };
  if (first === "wishlist") return { name: "wishlist", query };
  if (first === "checkout") return { name: "checkout", query };
  return { name: "notfound", query };
}

export function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return useMemo(() => parseHash(hash), [hash]);
}
