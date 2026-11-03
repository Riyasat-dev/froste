import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import { useRoute } from "./lib/route";

function Page({ route }) {
  switch (route.name) {
    case "home":
      return <Home />;
    case "shop":
      return <Shop route={route} />;
    case "product":
      return <ProductPage id={route.id} />;
    case "wishlist":
      return <Wishlist />;
    case "checkout":
      return <Checkout />;
    default:
      return (
        <section className="px-6 py-40 text-center">
          <p className="font-serif text-3xl text-[#292824]">Page not found.</p>
          <a
            href="#home"
            className="mt-8 inline-block border border-[#292824] px-8 py-3 text-[10px] tracking-[2px] text-[#292824]"
          >
            BACK HOME
          </a>
        </section>
      );
  }
}

function App() {
  const route = useRoute();
  const pageKey = `${route.name}:${route.id ?? ""}:${route.filter ?? ""}`;

  // After the new page is mounted: jump to its section anchor, or to the top.
  useEffect(() => {
    const el =
      route.name === "home" && route.anchor
        ? document.getElementById(route.anchor)
        : null;
    if (el) el.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pageKey, route.anchor, route.name]);

  return (
    <>
      <Navbar />
      <motion.main
        key={pageKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Page route={route} />
      </motion.main>
      <Footer />
      <CartDrawer />
    </>
  );
}

export default App;
