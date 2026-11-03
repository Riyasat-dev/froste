import { CREDITS } from "../data/credits";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "#/shop/new" },
      { label: "Jackets", href: "#/shop?cat=Jackets" },
      { label: "Coats", href: "#/shop?cat=Coats" },
      { label: "Sweaters", href: "#/shop?cat=Sweaters" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact Us", href: "mailto:hello@froste.example" },
      { label: "Shipping & Returns", href: "mailto:hello@froste.example?subject=Shipping%20%26%20Returns" },
      { label: "Size Guide", href: "mailto:hello@froste.example?subject=Size%20Guide" },
    ],
  },
  {
    title: "FROSTÉ",
    links: [
      { label: "Our Story", href: "#story" },
      { label: "The Campaign", href: "#campaign" },
      { label: "Newsletter", href: "#newsletter" },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-[#292824] px-6 pb-10 pt-20 text-[#d8d0c3] md:px-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <a href="#home" className="font-serif text-3xl font-semibold tracking-[5px] text-[#f5f3ef]">
              FROSTÉ
            </a>
            <p className="mt-5 max-w-xs text-sm leading-7 text-[#d8d0c3]/70">Winter, Worn Beautifully.</p>
            <p className="mt-6 text-[10px] tracking-[2px] text-[#d8d0c3]/50">
              COMPLIMENTARY SHIPPING ON ORDERS OVER $150
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-5 text-[10px] tracking-[3px] text-[#f5f3ef]">{col.title.toUpperCase()}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-[#d8d0c3]/70 transition hover:text-white">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 border-t border-[#d8d0c3]/15 pt-8 text-[10px] leading-6 tracking-[1.5px] text-[#d8d0c3]/50">
          <p>
            3D MODELS (RE-POSED, SIMPLIFIED AND RECOLOURED) FROM SKETCHFAB, LICENSED{" "}
            <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
              CC BY 4.0
            </a>
            :{" "}
            {CREDITS.map((c, i) => (
              <span key={c.url}>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
                  {c.title.toUpperCase()}
                </a>{" "}
                BY {c.author.toUpperCase()}
                {i < CREDITS.length - 1 ? " · " : "."}
              </span>
            ))}
          </p>
          <div className="mt-6 flex flex-col justify-between gap-2 md:flex-row">
            <p>© {new Date().getFullYear()} FROSTÉ. ALL RIGHTS RESERVED.</p>
            <p>A DEMO STORE</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
