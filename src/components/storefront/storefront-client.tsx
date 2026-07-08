"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CatalogBrowser } from "./catalog-browser";

type StorefrontProduct = {
  id: string;
  categoryId: string;
  name: string;
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

const DISCORD_URL = "https://discord.gg/KT8RRtF48t";

function modalSocialLinks(discordUrl: string) {
  const url = discordUrl || DISCORD_URL;
  return [
    { label: "Discord", icon: "fa-brands fa-discord", href: url },
  ];
}

const paymentRegions = [
  { flag: "🇦🇷", region: "Argentina", methods: ["MP, Naranja X, Uala y billeteras virtuales", "Transferencia bancaria"] },
  { flag: "🇲🇽", region: "Mexico", methods: ["Transferencia SPEI", "Deposito OXXO"] },
  { flag: "🇵🇪", region: "Peru", methods: ["Yape sin comision", "Plin", "BBVA"] },
  { flag: "🇨🇱", region: "Chile", methods: ["Transferencia bancaria", "Billeteras virtuales"] },
  { flag: "🇪🇨", region: "Ecuador", methods: ["Banco Pichincha", "Transferencia bancaria"] },
  { flag: "🇨🇴", region: "Colombia", methods: ["Nequi", "Corresponsal Bancolombia", "Transferencia bancaria"] },
  { flag: "🇻🇪", region: "Venezuela", methods: ["Pago Movil"] },
  { flag: "🌎", region: "Internacional", methods: ["Binance sin comision", "Litecoin sin comision"] },
];

function productImages(product?: StorefrontProduct | null) {
  if (!product) {
    return [];
  }

  return Array.from(new Set([...(product.imageUrls ?? []), product.imageUrl].filter(Boolean) as string[]));
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type StorefrontData = {
  settings: {
    discordUrl: string;
    supportBody: string;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    accentColor: string;
    products: StorefrontProduct[];
  }>;
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    content: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    message: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }>;
  summary: {
    totalAvailableStock: number;
  };
};

export function StorefrontClient({ data }: { data: StorefrontData }) {
  const [activeModal, setActiveModal] = useState<"about" | "faq" | "reviews" | "payments" | null>(null);
  const [activeProduct, setActiveProduct] = useState<StorefrontProduct | null>(null);
  const [activeProductImageIndex, setActiveProductImageIndex] = useState(0);
  const activeProductImages = productImages(activeProduct);
  const activeProductImage = activeProductImages[activeProductImageIndex] || activeProductImages[0] || "/ballen.png";

  // Particles logic
  useEffect(() => {
    const container = document.getElementById("particles-container");
    if (!container) return;

    const createParticle = () => {
      const particle = document.createElement("div");
      const size = Math.random() * 5 + 2;
      const colors = ["purple", "white", "blue", "pink"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.className = `particle ${color}`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
      particle.style.opacity = `${Math.random() * 0.5 + 0.1}`;
      
      container.appendChild(particle);
      
      setTimeout(() => {
        if (container.contains(particle)) {
          particle.remove();
        }
      }, 15000);
    };

    const particleInterval = setInterval(createParticle, 300);

    return () => {
      clearInterval(particleInterval);
      container.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div id="particles-container"></div>

      {/* MODALS */}
      {activeModal === "about" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content-ghost about-animated" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            <h2 className="about-title">👾 PHANTOM STORE</h2>
            
            <div className="about-section fade-in-up">
              <p className="about-intro">La Mejor Shop de Discord :D 100% Legit.</p>
            </div>
            
            <div className="about-section fade-in-up delay-1">
              <h3>¿Quiénes somos?</h3>
              <p>{data.settings.supportBody || "Somos la tienda número 1 en Discord para cuentas, servicios digitales y más. Llevamos tiempo ofreciendo los mejores productos del mercado con entregas inmediatas y un soporte que no te dejará tirado. Si buscas calidad y seguridad, estás en el lugar correcto."}</p>
            </div>

            <div className="about-stats fade-in-up delay-2">
              <div className="stat-item">
                <span className="stat-number">{data.reviews.length * 60}+</span>
                <span className="stat-label">Ventas realizadas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Soporte disponible</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Garantía</span>
              </div>
            </div>
            
            <div className="about-section fade-in-up delay-3">
              <h3>✨ ¿Por qué elegirnos?</h3>
              <div className="about-features">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>Entregas inmediatas</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🛡️</span>
                  <span>Garantía en todos los productos</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💰</span>
                  <span>Los mejores precios</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🤝</span>
                  <span>Atención personalizada</span>
                </div>
              </div>
            </div>
            
            <p className="about-cta fade-in-up delay-4">¿Listo para disfrutar? ¡Contáctanos en Discord! 👻</p>
          </div>
        </div>
      )}

      {activeModal === "faq" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content-ghost" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            <h2>❓ Preguntas Frecuentes (FAQ)</h2>
            
            <div className="faq-text">
              {data.faqs.map((faq) => (
                <div key={faq.id}>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
              {data.faqs.length === 0 && (
                <>
                  <h3>¿Cómo es el proceso de entrega?</h3>
                  <p>Las entregas son automáticas o casi inmediatas a través de nuestro servidor de Discord o correo. ¡Sin demoras raras! ⚡</p>
                  
                  <h3>¿Qué pasa si mi cuenta/producto tiene problemas?</h3>
                  <p>¡Tranquilo! Todos nuestros productos cuentan con garantía real. Solo abre un ticket en nuestro Discord y te lo reponemos o solucionamos en minutos. 🛡️</p>

                  <h3>¿Qué métodos de pago aceptan?</h3>
                  <p>Aceptamos PayPal, Crypto y algunos métodos locales. Pregunta en nuestro servidor por opciones específicas. 💰</p>
                </>
              )}
            </div>
            
            <p className="contact-text">¿Dudas específicas? ¡Abre ticket en nuestro Discord! 👾</p>
          </div>
        </div>
      )}

      {activeModal === "reviews" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content-ghost modal-reviews" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            <h2>⭐ Reviews</h2>
            <p className="reviews-question">¿Qué opinan nuestros usuarios de nuestros productos?</p>
            <div className="reviews-grid">
              {data.reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-avatar-container">
                      {review.author.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="review-name">{review.author}</span>
                  </div>
                  <p className="review-comment">&quot;{review.content}&quot;</p>
                  <div className="review-stars">
                    {Array.from({ length: review.rating }).map(() => "⭐").join("")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeModal === "payments" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content-ghost modal-payments" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            <h2>Metodos de pago</h2>
            <p className="reviews-question">Vendemos en toda Latinoamerica. Estos son algunos metodos; por ticket confirmamos disponibilidad y comision.</p>
            <div className="payment-grid">
              {paymentRegions.map((item) => (
                <article key={item.region} className="payment-card">
                  <strong><span>{item.flag}</span> {item.region}</strong>
                  <ul>
                    {item.methods.map((method) => (
                      <li key={method}>{method}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className="payment-note">Binance y Litecoin sin comision. En otros metodos puede aplicar 8% de comision.</p>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL ("VENTANITA") */}
      {activeProduct && (
        <div className="product-buy-overlay" onClick={() => setActiveProduct(null)}>
          <div className="product-buy-modal" onClick={e => e.stopPropagation()}>
            <button className="product-buy-close" onClick={() => setActiveProduct(null)} aria-label="Cerrar">
              &times;
            </button>

            <div className="product-buy-gallery">
              {activeProductImages.length > 1 && (
                <div className="product-buy-thumbs" aria-label="Imagenes del producto">
                  {activeProductImages.slice(0, 6).map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      className={`product-buy-thumb ${activeProductImageIndex === index ? "active" : ""}`}
                      onClick={() => setActiveProductImageIndex(index)}
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${activeProduct.name} imagen ${index + 1}`}
                        width={82}
                        height={82}
                        unoptimized={image.startsWith("http")}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="product-buy-main-image">
                <Image
                  src={activeProductImage}
                  alt={activeProduct.name}
                  width={720}
                  height={720}
                  unoptimized={activeProductImage.startsWith("http")}
                  priority
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            <div className="product-buy-info">
              <h2>{activeProduct.name}</h2>
              <div className="product-buy-price">${formatUsd(activeProduct.priceUsd)} USD</div>
              <div className="product-buy-copy">
                {activeProduct.shortDescription && (
                  <p><strong>Nota:</strong> {activeProduct.shortDescription}</p>
                )}
                <p><strong>Descripción:</strong> {activeProduct.description || activeProduct.shortDescription || "Entrega por ticket en Discord."}</p>
              </div>
              <a href={data.settings.discordUrl} target="_blank" rel="noreferrer" className="product-buy-cta">
                ¡Compra en nuestras redes!
              </a>
              <div className="product-buy-socials" aria-label="Redes sociales">
                {modalSocialLinks(data.settings.discordUrl).map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                    <i className={link.icon}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="ghost-header">
        <div className="ghost-logo">
          PHANTOM STORE
        </div>
        <nav className="ghost-nav">
          <button onClick={() => setActiveModal("about")}>Sobre nosotros</button>
          <button onClick={() => setActiveModal("payments")}>Métodos</button>
          <button onClick={() => setActiveModal("reviews")}>Reviews</button>
          <button onClick={() => setActiveModal("faq")}>FAQ</button>
        </nav>
        <div className="header-social">
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="ghost-social-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.808 0 1.451.73 1.438 1.613 0 .888-.636 1.612-1.438 1.612Z"/>
            </svg>
            Discord
          </a>
        </div>
      </header>

      {/* Anuncios removidos */}

      {/* HERO SECTION */}
      <section className="hero-section">
        {/* Viento y nieve */}
        <div className="wind-lines">
          <div className="wind-line" style={{ top: '20%', animationDelay: '0s' }}></div>
          <div className="wind-line" style={{ top: '40%', animationDelay: '2s' }}></div>
          <div className="wind-line" style={{ top: '60%', animationDelay: '1s' }}></div>
          <div className="wind-line" style={{ top: '80%', animationDelay: '3s' }}></div>
        </div>
        <div className="snowflakes" aria-hidden="true">
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
        </div>
        
        <div className="hero-overlay-content">
          <div className="hero-stats-bar">
            <div className="hero-stat">
              <span className="hero-stat-num">+67</span>
              <span className="hero-stat-label">Mi stock</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">Confiable</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-num">24/7</span>
              <span className="hero-stat-label">Soporte</span>
            </div>
          </div>

          <p className="hero-sub-heading" style={{ marginTop: '30px' }}>
            VEN AH GASTAR TU SUELDO BASICO AQUI
          </p>
          
          <div className="hero-cta">
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cta-btn primary">
              <i className="fab fa-discord"></i> Únete al Discord
            </a>
            <a href="#productos" className="cta-btn secondary">
              <span>Ver Productos</span> <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>



        {/* Iconos flotantes */}
        <div className="floating-icons">
          <span className="float-icon" style={{ fontSize: '2rem' }}>🔥</span>
          <span className="float-icon" style={{ fontSize: '2rem' }}>💸</span>
          <span className="float-icon" style={{ fontSize: '2.5rem' }}>🔥</span>
          <span className="float-icon" style={{ fontSize: '2rem', top: '10%', left: '80%' }}>💸</span>
          <span className="float-icon" style={{ fontSize: '2rem', top: '80%', left: '20%' }}>🔥</span>
          <span className="float-icon" style={{ fontSize: '2.5rem', top: '45%', left: '85%' }}>💸</span>
          <span className="float-icon" style={{ fontSize: '2rem', top: '30%', left: '15%' }}>🔥</span>
        </div>

      </section>

      {/* PRODUCTOS */}
      <section className="productos-section" id="productos">
        <div id="particles-productos"></div>
        <div className="productos-container">
          <h2 style={{ position: 'relative' }}>Productos</h2>
          <p className="productos-subtitle">Explora nuestra colección premium de cuentas y servicios digitales</p>
          
          <CatalogBrowser 
            categories={data.categories} 
            onBuyClick={(product) => {
              setActiveProduct(product);
              setActiveProductImageIndex(0);
            }}
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a0a0a', padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>By Matteduk</p>
          <p>Contáctame: <a href="mailto:creppet@gmail.com" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>creppet@gmail.com</a> | Discord: <span style={{ color: 'rgba(255,255,255,0.7)' }}>matteduk</span></p>
          <p style={{ marginTop: '20px', fontSize: '12px' }}>
            Phantom store no está afiliada, patrocinada ni respaldada por Discord, Minecraft, Fortnite, Roblox, servicios de streaming ni ninguna marca mencionada. Todas las marcas, logos y nombres pertenecen a sus respectivos dueños. Las compras se atienden por ticket en Discord; revisa disponibilidad, condiciones, garantía y tiempos de entrega antes de pagar. No nos hacemos responsables por compras realizadas fuera de nuestros canales oficiales, errores causados por datos entregados incorrectamente, reventas no autorizadas o cambios externos de plataformas de terceros.
          </p>
        </div>
      </footer>
    </>
  );
}
