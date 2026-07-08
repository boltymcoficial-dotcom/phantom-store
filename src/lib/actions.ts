"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import {
  createId,
  readStoreData,
  STOCK_STATUS_VALUES,
  type StockStatus,
  uploadProductImage as uploadProductImageToStore,
  writeStoreData,
} from "@/lib/store-data";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  accentColor: z.string().min(1),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

const productSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  badge: z.string().optional(),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  features: z.string().min(1),
  deliveryDetails: z.string().min(1),
  imageUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  priceUsd: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isSold: z.boolean(),
});

const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  message: z.string().min(1),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5),
  answer: z.string().min(8),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

const reviewSchema = z.object({
  id: z.string().optional(),
  author: z.string().min(2),
  content: z.string().min(8),
  rating: z.coerce.number().int().min(1).max(5),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

const paymentMethodSchema = z.object({
  id: z.string().optional(),
  region: z.string().min(2),
  methods: z.string().min(3),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

function optionalNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function textValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "item";
}

function parseImageUrls(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function uploadSingleProductImage(file: File) {
  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }

  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
    return undefined;
  }

  const uploadedUrl = await uploadProductImageToStore(file);

  return uploadedUrl || undefined;
}

async function uploadProductImages(formData: FormData) {
  const files = formData.getAll("imageFile");
  const uploaded: string[] = [];

  for (const file of files) {
    if (file instanceof File) {
      const url = await uploadSingleProductImage(file);
      if (url) {
        uploaded.push(url);
      }
    }
  }

  return uploaded;
}

async function protect() {
  await requireAdmin();
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@smartshop.mx").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "SmartsAdmin123!";

  if (email !== adminEmail || password !== adminPassword) {
    redirect("/admin/login?error=Credenciales%20inv%C3%A1lidas");
  }

  await createSession("admin-session", adminEmail);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function updateStoreSettingsAction(formData: FormData) {
  await protect();
  const store = await readStoreData();
  store.settings = {
    ...store.settings,
    brandName: String(formData.get("brandName") ?? ""),
    brandLabel: String(formData.get("brandLabel") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroDescription: String(formData.get("heroDescription") ?? ""),
    heroEyebrow: String(formData.get("heroEyebrow") ?? ""),
    primaryColor: String(formData.get("primaryColor") ?? ""),
    secondaryColor: String(formData.get("secondaryColor") ?? ""),
    discordUrl: String(formData.get("discordUrl") ?? ""),
    discordLabel: String(formData.get("discordLabel") ?? ""),
    supportHeadline: String(formData.get("supportHeadline") ?? ""),
    supportBody: String(formData.get("supportBody") ?? ""),
    featuredTitle: String(formData.get("featuredTitle") ?? ""),
    featuredPrice: Number(formData.get("featuredPrice") ?? 0),
    featuredStockNote: String(formData.get("featuredStockNote") ?? ""),
    featuredBenefits: String(formData.get("featuredBenefits") ?? ""),
  };
  await writeStoreData(store);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function saveCategoryAction(formData: FormData) {
  await protect();
  const name = textValue(formData.get("name"));

  if (!name) {
    revalidatePath("/admin");
    return;
  }

  const payload = categorySchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    name,
    slug: textValue(formData.get("slug")) || slugify(name),
    description: textValue(formData.get("description")) || "Categoria de productos de la tienda.",
    accentColor: textValue(formData.get("accentColor")) || "#ff4fa6",
    position: textValue(formData.get("position")) || "10",
    isActive: parseCheckbox(formData.get("isActive")),
  });
  const store = await readStoreData();

  if (payload.id) {
    store.categories = store.categories.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
  } else {
    store.categories.push({
      ...payload,
      id: createId("cat"),
    });
  }
  await writeStoreData(store);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteCategoryAction(formData: FormData) {
  await protect();
  const id = String(formData.get("id") ?? "");
  const store = await readStoreData();
  const productIds = store.products.filter((item) => item.categoryId === id).map((item) => item.id);
  store.categories = store.categories.filter((item) => item.id !== id);
  store.products = store.products.filter((item) => item.categoryId !== id);
  store.stockItems = store.stockItems.filter((item) => !productIds.includes(item.productId));
  await writeStoreData(store);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function saveProductAction(formData: FormData) {
  await protect();
  const name = textValue(formData.get("name"));
  const categoryId = textValue(formData.get("categoryId"));
  const note = textValue(formData.get("shortDescription"));
  const description = textValue(formData.get("description"));

  if (!name || !categoryId) {
    revalidatePath("/admin");
    return;
  }

  const uploadedImageUrls = await uploadProductImages(formData);
  const existingImageUrls = parseImageUrls(formData.get("imageUrls"));
  const primaryImageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageUrls = Array.from(new Set([...uploadedImageUrls, primaryImageUrl, ...existingImageUrls].filter(Boolean)));

  const payload = productSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    categoryId,
    name,
    slug: textValue(formData.get("slug")) || slugify(name),
    badge: String(formData.get("badge") ?? "").trim() || undefined,
    shortDescription: note || description || "Producto disponible por ticket en Discord.",
    description: description || note || "Producto disponible por ticket en Discord.",
    features: textValue(formData.get("features")) || note || "Entrega por ticket.\nSoporte por Discord.",
    deliveryDetails: textValue(formData.get("deliveryDetails")) || "Entrega coordinada por ticket en Discord.",
    imageUrl: imageUrls[0] || undefined,
    imageUrls,
    priceUsd: textValue(formData.get("priceUsd")) || "0",
    compareAtPrice: optionalNumber(formData.get("compareAtPrice")),
    isActive: parseCheckbox(formData.get("isActive")),
    isFeatured: parseCheckbox(formData.get("isFeatured")),
    isSold: parseCheckbox(formData.get("isSold")),
  });
  const store = await readStoreData();

  if (payload.id) {
    store.products = store.products.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
  } else {
    store.products.push({
      ...payload,
      id: createId("prod"),
      createdAt: new Date().toISOString(),
    });
  }
  await writeStoreData(store);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function saveAnnouncementAction(formData: FormData) {
  await protect();
  const title = textValue(formData.get("title"));
  const message = textValue(formData.get("message"));

  if (!title || !message) {
    revalidatePath("/admin");
    return;
  }

  const payload = announcementSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    title,
    message,
    ctaLabel: textValue(formData.get("ctaLabel")) || undefined,
    ctaUrl: textValue(formData.get("ctaUrl")) || undefined,
    position: textValue(formData.get("position")) || "10",
    isActive: parseCheckbox(formData.get("isActive")),
  });
  const store = await readStoreData();
  const announcements = store.announcements ?? [];

  if (payload.id) {
    store.announcements = announcements.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
  } else {
    store.announcements = [...announcements, { ...payload, id: createId("ann") }];
  }

  await writeStoreData(store);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await protect();
  const id = String(formData.get("id") ?? "");
  const store = await readStoreData();
  store.announcements = (store.announcements ?? []).filter((item) => item.id !== id);
  await writeStoreData(store);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteProductAction(formData: FormData) {
  await protect();
  const id = String(formData.get("id") ?? "");
  const store = await readStoreData();
  store.products = store.products.filter((item) => item.id !== id);
  store.stockItems = store.stockItems.filter((item) => item.productId !== id);
  await writeStoreData(store);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function addStockItemsAction(formData: FormData) {
  await protect();

  const productId = String(formData.get("productId") ?? "");
  const lines = String(formData.get("items") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length) {
    const store = await readStoreData();
    store.stockItems.push(
      ...lines.map((code) => ({
        id: createId("stock"),
        productId,
        code,
        status: "AVAILABLE" as StockStatus,
        createdAt: new Date().toISOString(),
      })),
    );
    await writeStoreData(store);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateStockStatusAction(formData: FormData) {
  await protect();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as StockStatus;
  if (!STOCK_STATUS_VALUES.includes(status)) {
    return;
  }
  const store = await readStoreData();
  store.stockItems = store.stockItems.map((item) => (item.id === id ? { ...item, status } : item));
  await writeStoreData(store);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteStockItemAction(formData: FormData) {
  await protect();
  const id = String(formData.get("id") ?? "");
  const store = await readStoreData();
  store.stockItems = store.stockItems.filter((item) => item.id !== id);
  await writeStoreData(store);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function saveFaqAction(formData: FormData) {
  await protect();
  const payload = faqSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    question: formData.get("question"),
    answer: formData.get("answer"),
    position: formData.get("position"),
    isActive: parseCheckbox(formData.get("isActive")),
  });
  const store = await readStoreData();

  if (payload.id) {
    store.faqs = store.faqs.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
  } else {
    store.faqs.push({
      ...payload,
      id: createId("faq"),
    });
  }
  await writeStoreData(store);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteFaqAction(formData: FormData) {
  await protect();
  const id = String(formData.get("id") ?? "");
  const store = await readStoreData();
  store.faqs = store.faqs.filter((item) => item.id !== id);
  await writeStoreData(store);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function saveReviewAction(formData: FormData) {
  await protect();
  const payload = reviewSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    author: formData.get("author"),
    content: formData.get("content"),
    rating: formData.get("rating"),
    position: formData.get("position"),
    isActive: parseCheckbox(formData.get("isActive")),
  });
  const store = await readStoreData();

  if (payload.id) {
    store.reviews = store.reviews.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
  } else {
    store.reviews.push({
      ...payload,
      id: createId("review"),
    });
  }
  await writeStoreData(store);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteReviewAction(formData: FormData) {
  await protect();
  const id = String(formData.get("id") ?? "");
  const store = await readStoreData();
  store.reviews = store.reviews.filter((item) => item.id !== id);
  await writeStoreData(store);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function savePaymentMethodAction(formData: FormData) {
  await protect();
  const payload = paymentMethodSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    region: formData.get("region"),
    methods: formData.get("methods"),
    position: formData.get("position"),
    isActive: parseCheckbox(formData.get("isActive")),
  });
  const store = await readStoreData();

  if (payload.id) {
    store.paymentMethods = store.paymentMethods.map((item) =>
      item.id === payload.id ? { ...item, ...payload } : item,
    );
  } else {
    store.paymentMethods.push({
      ...payload,
      id: createId("payment"),
    });
  }
  await writeStoreData(store);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deletePaymentMethodAction(formData: FormData) {
  await protect();
  const id = String(formData.get("id") ?? "");
  const store = await readStoreData();
  store.paymentMethods = store.paymentMethods.filter((item) => item.id !== id);
  await writeStoreData(store);
  revalidatePath("/");
  revalidatePath("/admin");
}
