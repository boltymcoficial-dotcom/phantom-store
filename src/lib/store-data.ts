import "server-only";


export type StockStatus = "AVAILABLE" | "SOLD" | "DISABLED";
export const STOCK_STATUS_VALUES: StockStatus[] = ["AVAILABLE", "SOLD", "DISABLED"];

export type StoreSettings = {
  id: string;
  brandName: string;
  brandLabel: string;
  tagline: string;
  heroTitle: string;
  heroDescription: string;
  heroEyebrow: string;
  primaryColor: string;
  secondaryColor: string;
  discordUrl: string;
  discordLabel: string;
  supportHeadline: string;
  supportBody: string;
  featuredTitle: string;
  featuredPrice: number;
  featuredStockNote: string;
  featuredBenefits: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  accentColor: string;
  position: number;
  isActive: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  badge?: string;
  shortDescription: string;
  description: string;
  features: string;
  deliveryDetails: string;
  imageUrl?: string;
  imageUrls?: string[];
  priceUsd: number;
  compareAtPrice?: number;
  isActive: boolean;
  isFeatured: boolean;
  isSold?: boolean;
  createdAt: string;
};

export type StockItem = {
  id: string;
  productId: string;
  code: string;
  note?: string;
  status: StockStatus;
  createdAt: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  content: string;
  position: number;
  isActive: boolean;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  position: number;
  isActive: boolean;
};

export type PaymentMethod = {
  id: string;
  region: string;
  methods: string;
  position: number;
  isActive: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  position: number;
  isActive: boolean;
};

export type StoreFile = {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  stockItems: StockItem[];
  reviews: Review[];
  faqs: FaqItem[];
  paymentMethods: PaymentMethod[];
  announcements: Announcement[];
};

const DEFAULT_STORE: StoreFile = {
  settings: {
    id: "main",
    brandName: "Phantom",
    brandLabel: "Discord shop",
    tagline: "Productos digitales con entrega rapida, soporte por ticket y stock administrable.",
    heroTitle: "La tienda digital que convierte visitas en ventas reales",
    heroDescription: "Phantom esta pensada para vender cuentas, servicios y digitales con catalogo claro, secciones de confianza y control interno completo.",
    heroEyebrow: "Storefront premium",
    primaryColor: "#ff4fa6",
    secondaryColor: "#ff8cc2",
    discordUrl: process.env.DISCORD_URL ?? "https://discord.gg/",
    discordLabel: "Comprar en Discord",
    supportHeadline: "Lista para crecer contigo y salir a produccion",
    supportBody: "El flujo es simple y solido: muestras stock, guias la compra a Discord, administras inventario por lotes.",
    featuredTitle: "Acceso premium y cuentas digitales verificadas",
    featuredPrice: 10,
    featuredStockNote: "El numero visible se conecta al stock real cargado en el panel.",
    featuredBenefits: "Entrega coordinada por ticket.\nInventario visible para el cliente.\nProductos editables y categorias escalables.",
  },
  categories: [],
  products: [],
  stockItems: [],
  reviews: [],
  faqs: [],
  paymentMethods: [],
  announcements: [],
};

const SUPABASE_URL = "https://lvmvqwgtgvtqlyforsrp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXZxd2d0Z3Z0cWx5Zm9yc3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NzM1NDcsImV4cCI6MjA5OTA0OTU0N30.UdlnBrEsT8fHUSlAwHa6DGQ_-e6yRxbemdpT7pDsZ0A";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXZxd2d0Z3Z0cWx5Zm9yc3JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQ3MzU0NywiZXhwIjoyMDk5MDQ5NTQ3fQ.-q7BzPhiG-FPvyXvYc2jwYoWqywRJl52QHAwsJbojow";

export async function readStoreData(): Promise<StoreFile> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/store_state?id=eq.main&select=data`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { tags: ["store-data"] },
    });
    const json = await res.json();
    if (json && json.length > 0 && json[0].data) {
      return json[0].data as StoreFile;
    }
    return DEFAULT_STORE;
  } catch (err) {
    console.error("Error reading from Supabase:", err);
    return DEFAULT_STORE;
  }
}

export async function writeStoreData(data: StoreFile): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/store_state?id=eq.main`, {
    method: "PATCH",
    headers: {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify({ data })
  });
}

export function createId(): string {
  return crypto.randomUUID();
}

export async function uploadProductImage(
  file: File,
  _existingUrl?: string
): Promise<string> {
  // For CF Pages: return a data URL or placeholder
  // Images are stored as base64 in KV or via external URL
  const bytes = await file.arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const mimeType = file.type || "image/webp";
  return `data:${mimeType};base64,${b64}`;
}
