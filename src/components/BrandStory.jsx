import { motion } from "framer-motion";

const pillars = [
  { n: "01", title: "Insulated for real winters", text: "Responsibly sourced down and recycled fills, tested well below freezing." },
  { n: "02", title: "Tailored, not bulky", text: "Clean silhouettes cut to layer easily and move with you." },
  { n: "03", title: "Built to be kept", text: "Reinforced seams and durable fabrics, made to last many seasons." },
];

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8 },
};

function BrandStory() {
  return (
    <section id="story" className="bg-[#f5f3ef] px-6 py-24 md:px-16 md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-16 md:grid-cols-2 md:gap-24">
        <motion.div {...reveal}>
          <p className="mb-6 text-[10px] tracking-[4px] text-[#8a3d45]">OUR STORY</p>
          <h2 className="font-serif text-5xl leading-[1.08] text-[#292824] md:text-7xl">
            Made for the Cold.
            <br />
            <span className="italic text-[#8a3d45]">Designed to Be Remembered.</span>
          </h2>
          <p className="mt-8 max-w-md text-sm leading-7 text-[#69665e]">
            FROSTÉ began with a simple idea: winter clothing should feel as considered as it performs.
            Every piece is designed to hang beautifully, wear quietly and stay with you for years.
          </p>
        </motion.div>

        <ul className="divide-y divide-[#292824]/10 border-y border-[#292824]/10">
          {pillars.map((p, i) => (
            <motion.li
              key={p.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="flex gap-6 py-8"
            >
              <span className="font-serif text-3xl text-[#292824]/25">{p.n}</span>
              <div>
                <h3 className="font-serif text-xl text-[#292824]">{p.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-7 text-[#69665e]">{p.text}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default BrandStory;
