import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";

// three.js loads only after the first paint, so the headline appears instantly
const HangingGarment = lazy(() => import("./HangingGarment"));

function Hero() {
  const [active, setActive] = useState(false);

  return (
    <section
      id="home"
      className="relative flex min-h-[560px] items-center overflow-hidden bg-[#e9e5dc] px-6 md:h-[calc(100svh-104px)] md:px-16"
    >
      {/* soft vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(255,255,255,0.55),transparent_60%)]" />

      <div
        role="img"
        aria-label="A wool coat hanging on a wooden hanger. Hover to straighten it."
        onPointerEnter={(e) => e.pointerType === "mouse" && setActive(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setActive(false)}
        onPointerUp={(e) => e.pointerType !== "mouse" && setActive((a) => !a)}
        className="absolute inset-y-0 right-0 w-full touch-pan-y opacity-60 md:w-[55%] md:opacity-100"
      >
        <Suspense fallback={null}>
          <HangingGarment type="coat" model={{ url: "/models/coat-01.glb", bottom: -3.3 }} color="#b98b5e" tilt={-0.18} seed={2} active={active} snow />
        </Suspense>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        <div className="max-w-xl py-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-xs tracking-[5px] text-[#8a3d45]"
          >
            THE WINTER COLLECTION — 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-6xl leading-[1.05] text-[#292824] md:text-8xl"
          >
            Winter,
            <br />
            Worn
            <br />
            Beautifully.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-7 max-w-sm text-sm leading-7 text-[#69665e]"
          >
            Discover timeless winter essentials crafted for warmth, comfort and effortless elegance.
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            href="#collection"
            className="mt-9 inline-flex bg-[#292824] px-9 py-4 text-xs tracking-[2px] text-white transition hover:bg-[#8a3d45]"
          >
            EXPLORE COLLECTION →
          </motion.a>
        </div>
      </div>

      <div className="absolute bottom-8 right-10 hidden text-[10px] tracking-[3px] text-[#77736a] md:block">
        HOVER THE COAT · SCROLL TO DISCOVER
      </div>
    </section>
  );
}

export default Hero;
