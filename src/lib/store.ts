import "server-only";

import { readStoreData } from "@/lib/store-data";

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeImages(product: { imageUrl?: string; imageUrls?: string[] }) {
  return Array.from(new Set([...(product.imageUrls ?? []), product.imageUrl].filter(Boolean) as string[]));
}

export async function getStorefrontData() {
  const store = await readStoreData();

  const normalizedCategories = store.categories
    .filter((category) => category.isActive)
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
    ...category,
    products: store.products
      .filter((product) => product.categoryId === category.id && product.isActive)
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
      .map((product) => ({
      ...product,
      imageUrls: normalizeImages(product),
      availableStock: product.isSold ? 0 : 1,
      features: splitLines(product.features),
    })),
  }));

  return {
    settings: {
      ...store.settings,
      featuredBenefits: splitLines(store.settings.featuredBenefits),
    },
    categories: normalizedCategories,
    reviews: store.reviews.filter((item) => item.isActive).sort((a, b) => a.position - b.position),
    faqs: store.faqs.filter((item) => item.isActive).sort((a, b) => a.position - b.position),
    paymentMethods: store.paymentMethods.filter((item) => item.isActive).sort((a, b) => a.position - b.position),
    announcements: (store.announcements ?? []).filter((item) => item.isActive).sort((a, b) => a.position - b.position),
    summary: {
      totalAvailableStock: 50,
    },
  };
}

export async function getAdminDashboardData() {
  const store = await readStoreData();

  return {
    settings: store.settings,
    categories: store.categories
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((category) => ({
        ...category,
        _count: {
          products: store.products.filter((product) => product.categoryId === category.id).length,
        },
      })),
    products: store.products
      .slice()
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
      .map((product) => ({
      ...product,
      imageUrls: normalizeImages(product),
      category: store.categories.find((category) => category.id === product.categoryId)!,
      stockItems: [],
      availableStock: product.isSold ? 0 : 1,
      soldStock: product.isSold ? 1 : 0,
    })),
    reviews: store.reviews.slice().sort((a, b) => a.position - b.position),
    faqs: store.faqs.slice().sort((a, b) => a.position - b.position),
    paymentMethods: store.paymentMethods.slice().sort((a, b) => a.position - b.position),
    announcements: (store.announcements ?? []).slice().sort((a, b) => a.position - b.position),
  };
}
