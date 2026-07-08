"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type Product = {
  id: string;
  categoryId: string;
  name: string;
  badge?: string;
  shortDescription: string;
  description?: string;
  features?: string[];
  imageUrl?: string;
  imageUrls?: string[];
  priceUsd: number;
  compareAtPrice?: number;
  availableStock: number;
  isSold?: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  accentColor: string;
  products: Product[];
};

type CatalogBrowserProps = {
  categories: Category[];
  onBuyClick: (product: Product) => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function productImages(product: Product) {
  return Array.from(new Set([...(product.imageUrls ?? []), product.imageUrl].filter(Boolean) as string[]));
}

export function CatalogBrowser({ categories, onBuyClick }: CatalogBrowserProps) {
  const firstCategoryWithProducts = categories.find((category) => category.products.length > 0);
  const defaultCategoryId = firstCategoryWithProducts?.id ?? categories[0]?.id ?? "";
  const [activeCategoryId, setActiveCategoryId] = useState(defaultCategoryId);

  const visibleProducts = useMemo(() => {
    const category =
      categories.find((item) => item.id === activeCategoryId) ??
      categories.find((item) => item.products.length > 0) ??
      categories[0];

    if (!category) {
      return [];
    }

    return category.products.map((product) => ({
      ...product,
      category,
    }));
  }, [activeCategoryId, categories]);

  return (
    <div className="space-y-6 w-full">
      <div className="categorias">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategoryId(category.id)}
            className={`categoria-btn ${activeCategoryId === category.id ? "active" : ""}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="productos-grid">
        {visibleProducts.map((product) => {
          const isSoldOut = product.isSold || product.availableStock <= 0;
          const images = productImages(product);
          const productImage = images[0] || "/ballen.png";
          const hoverImage = images[1];
          return (
            <article
              key={product.id}
              className={`producto-card ${isSoldOut ? 'vendido' : ''} ${hoverImage ? 'has-hover-image' : ''}`}
              style={{ 
                background: '#151515', 
                borderRadius: '15px', 
                overflow: 'hidden',
                boxShadow: isSoldOut ? '0 0 15px rgba(204, 0, 0, 0.4)' : '0 10px 30px rgba(0,0,0,0.5)',
                position: 'relative'
              }}
            >
              {isSoldOut && (
                <div style={{ position: 'absolute', top: 10, left: 10, background: '#cc0000', color: '#fff', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>&times;</span> VENDIDO
                </div>
              )}
              <div className="producto-imagen carousel-container" style={{ background: '#101010', clipPath: 'polygon(0 0, 100% 0, 100% 88%, 0 100%)', height: '190px' }}>
                <Image
                  src={productImage}
                  alt={product.name} 
                  width={320}
                  height={180}
                  unoptimized={productImage.startsWith("http")}
                  className="skin-img carousel-img active product-card-image product-card-image-primary" 
                  style={{ objectFit: images.length ? 'cover' : 'contain', width: '100%', height: '100%' }}
                />
                {hoverImage && (
                  <Image
                    src={hoverImage}
                    alt={`${product.name} vista 2`}
                    width={320}
                    height={180}
                    unoptimized={hoverImage.startsWith("http")}
                    className="skin-img carousel-img active product-card-image product-card-image-hover"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                )}
                {hoverImage && <span className="product-image-count">{images.length} fotos</span>}
              </div>

              <div className="producto-info" style={{ textAlign: 'center', padding: '20px' }}>
                <div className="producto-nombre" style={{ color: '#fff', fontWeight: '900', fontSize: '18px', textTransform: 'uppercase' }}>
                  {product.name}
                </div>
                
                <div className="producto-precio" style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '16px', margin: '10px 0 20px 0' }}>
                  ${formatMoney(product.priceUsd)} USD
                </div>

                <button
                  onClick={() => !isSoldOut && onBuyClick(product)}
                  className="btn-comprar"
                  disabled={isSoldOut}
                  style={{ 
                    background: isSoldOut ? '#8b0000' : '#fff', 
                    color: isSoldOut ? '#fff' : '#000', 
                    borderRadius: '8px', 
                    padding: '12px 0', 
                    width: '100%',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: isSoldOut ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSoldOut ? 'VENDIDO' : 'COMPRAR'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
