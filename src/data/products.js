// `type` picks the procedural fallback shape (puffer | coat | knit) used while a GLB loads.
// `model` points at a real GLB in /public/models (bottom = lowest point, used for camera framing).
// Models are reused across products; only the colour differs.
const c = (name, hex) => ({ name, hex });

const MODELS = {
  puffer1: { url: "/models/puffer-01.glb", bottom: -2.84, shoulderWidth: 0.82 },
  puffer2: { url: "/models/puffer-02.glb", bottom: -2.73, shoulderWidth: 0.81 },
  puffer3: { url: "/models/puffer-01.glb", bottom: -2.84, shoulderScale: 1 },
  coat1: { url: "/models/coat-01.glb", bottom: -3.3, shoulderWidth: 0.55 },
  coat2: { url: "/models/coat-02.glb", bottom: -3.23, shoulderWidth: 0.74 },
  hoodie1: { url: "/models/hoodie-01.glb", bottom: -2.91, shoulderWidth: 0.72 },
  hoodie2: { url: "/models/hoodie-02.glb", bottom: -2.73, shoulderWidth: 0.82 },
};

const products = [
  {
    id: 1,
    model: MODELS.puffer1,
    name: "The Alpine Puffer",
    category: "Jackets",
    type: "puffer",
    price: 189,
    gender: "men",
    tilt: -0.22,
    badge: "BESTSELLER",
    colors: [
      c("Stone Beige", "#cbbfae"),
      c("Burgundy", "#8a3d45"),
      c("Charcoal", "#3a3935"),
    ],
  },
  {
    id: 2,
    model: MODELS.coat1,
    name: "The Heritage Trench",
    category: "Coats",
    type: "coat",
    price: 249,
    gender: "women",
    tilt: 0.16,
    badge: "NEW ARRIVAL",
    colors: [
      c("Warm Camel", "#b98b5e"),
      c("Charcoal", "#4a4842"),
      c("Ivory", "#e8e2d6"),
    ],
  },
  {
    id: 3,
    model: MODELS.hoodie2,
    name: "The Cloud Hoodie",
    category: "Sweaters",
    type: "knit",
    kind: "hoodie",
    price: 99,
    was: 129,
    gender: "men",
    tilt: -0.14,
    badge: "",
    colors: [
      c("Soft Ivory", "#ece6d9"),
      c("Oat", "#cdbfa7"),
      c("Burgundy", "#8a3d45"),
    ],
  },
  {
    id: 4,
    model: MODELS.puffer2,
    name: "The Urban Puffer",
    category: "Jackets",
    type: "puffer",
    price: 199,
    gender: "women",
    tilt: 0.2,
    badge: "LIMITED",
    colors: [
      c("Midnight Black", "#2b2a27"),
      c("Soft Grey", "#a8a49c"),
      c("Stone Beige", "#cbbfae"),
    ],
  },
  {
    id: 5,
    model: MODELS.puffer3,
    name: "The Glacier Puffer",
    category: "Jackets",
    type: "puffer",
    price: 209,
    gender: "men",
    tilt: -0.18,
    badge: "NEW ARRIVAL",
    colors: [
      c("Frost Blue", "#9fb3bd"),
      c("Soft Ivory", "#ece6d9"),
      c("Charcoal", "#3a3935"),
    ],
  },
  {
    id: 6,
    model: MODELS.coat2,
    name: "The Highland Overcoat",
    category: "Coats",
    type: "coat",
    price: 279,
    gender: "women",
    tilt: 0.12,
    badge: "NEW ARRIVAL",
    colors: [
      c("Charcoal", "#4a4842"),
      c("Warm Camel", "#b98b5e"),
      c("Burgundy", "#8a3d45"),
    ],
  },
  {
    id: 7,
    model: MODELS.hoodie1,
    name: "The Fjord Hoodie",
    category: "Sweaters",
    type: "knit",
    kind: "hoodie",
    price: 139,
    gender: "men",
    tilt: 0.18,
    badge: "BESTSELLER",
    colors: [
      c("Forest", "#4f5d4a"),
      c("Oat", "#cdbfa7"),
      c("Charcoal", "#3a3935"),
    ],
  },
  {
    id: 8,
    model: MODELS.puffer1,
    name: "The Nordic Puffer",
    category: "Jackets",
    type: "puffer",
    price: 175,
    was: 219,
    gender: "men",
    tilt: -0.16,
    badge: "",
    colors: [
      c("Warm Camel", "#b98b5e"),
      c("Midnight Black", "#2b2a27"),
      c("Soft Grey", "#a8a49c"),
    ],
  },
  {
    id: 9,
    model: MODELS.coat1,
    name: "The Atelier Trench",
    category: "Coats",
    type: "coat",
    price: 269,
    gender: "women",
    tilt: -0.2,
    badge: "LIMITED",
    colors: [
      c("Ivory", "#e8e2d6"),
      c("Midnight Black", "#2b2a27"),
      c("Soft Grey", "#a8a49c"),
    ],
  },
  {
    id: 10,
    model: MODELS.hoodie2,
    name: "The Ember Hoodie",
    category: "Sweaters",
    type: "knit",
    kind: "hoodie",
    price: 119,
    gender: "men",
    tilt: 0.14,
    badge: "NEW ARRIVAL",
    colors: [
      c("Burgundy", "#8a3d45"),
      c("Soft Ivory", "#ece6d9"),
      c("Frost Blue", "#9fb3bd"),
    ],
  },
];

export const getProduct = (id) => products.find((p) => p.id === id);

export function searchProducts(q) {
  const query = (q || "").trim().toLowerCase();
  if (!query) return products;
  return products.filter((p) =>
    [
      p.name,
      p.category,
      p.type,
      p.kind,
      p.gender,
      ...p.colors.map((x) => x.name),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

export default products;
