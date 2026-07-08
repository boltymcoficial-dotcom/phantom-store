import Link from "next/link";
import {
  deleteAnnouncementAction,
  deleteCategoryAction,
  deleteProductAction,
  logoutAction,
  saveAnnouncementAction,
  saveCategoryAction,
  saveProductAction,
} from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/store";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} placeholder={placeholder} step={step} />
    </label>
  );
}

function Area({
  label,
  name,
  defaultValue,
  rows = 3,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} placeholder={placeholder} />
    </label>
  );
}

function Checkbox({ label, name, defaultChecked = false }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="admin-check">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span>{label}</span>
    </label>
  );
}

function FileField({ label, name }: { label: string; name: string }) {
  return (
    <div className="admin-field admin-file-field">
      <span>{label}</span>
      <input name={name} type="file" accept="image/*" multiple />
      <small>Puedes seleccionar varias imágenes con Ctrl/Shift, o usar estas casillas extra.</small>
      <div className="admin-file-extra">
        <input name={name} type="file" accept="image/*" />
        <input name={name} type="file" accept="image/*" />
      </div>
    </div>
  );
}

function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="admin-section-head">
      <div>
        <p className="admin-eyebrow">Panel</p>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const user = await requireAdmin();
  const data = await getAdminDashboardData();
  const totalStock = data.products.filter((product) => !product.isSold && product.isActive).length;
  const soldStock = data.products.reduce((total, product) => total + product.soldStock, 0);

  return (
    <main className="admin-clean admin-dashboard">
      <header className="admin-topbar">
        <div>
          <p className="admin-eyebrow">Admin simple</p>
          <h1>Productos y stock</h1>
          <p>Sesión: {user.email}</p>
        </div>
        <div className="admin-topbar-actions">
          <Link href="/">Ver tienda</Link>
          <form action={logoutAction}>
            <button type="submit">Cerrar sesión</button>
          </form>
        </div>
      </header>

      <section className="admin-stats">
        <div>
          <span>Productos</span>
          <strong>{data.products.length}</strong>
        </div>
        <div>
          <span>Disponibles</span>
          <strong>{totalStock}</strong>
        </div>
        <div>
          <span>Vendido</span>
          <strong>{soldStock}</strong>
        </div>
        <div>
          <span>Categorías</span>
          <strong>{data.categories.length}</strong>
        </div>
      </section>

      <nav className="admin-nav">
        <a href="#anuncios">Anuncios</a>
        <a href="#categorias">Categorías</a>
        <a href="#productos">Productos</a>
      </nav>

      <section id="anuncios" className="admin-card">
        <SectionTitle title="Anuncios" text="Mensajes rápidos para mostrar promociones, avisos o cambios de stock." />

        <details className="admin-details">
          <summary>Crear anuncio</summary>
          <form action={saveAnnouncementAction} className="admin-form">
            <div className="admin-form-grid">
              <Field label="Título" name="title" placeholder="Nuevo stock disponible" />
              <Field label="Botón opcional" name="ctaLabel" placeholder="Ir a Discord" />
              <Area label="Mensaje" name="message" placeholder="Abre ticket para confirmar disponibilidad." />
              <Field label="Link opcional" name="ctaUrl" placeholder="https://discord.gg/V64nVBA9yU" />
              <Field label="Posición" name="position" type="number" defaultValue={10} />
            </div>
            <Checkbox label="Activo" name="isActive" defaultChecked />
            <button type="submit" className="admin-primary">Crear anuncio</button>
          </form>
        </details>

        <div className="admin-list">
          {data.announcements.map((item) => (
            <form key={item.id} action={saveAnnouncementAction} className="admin-list-item">
              <input type="hidden" name="id" value={item.id} />
              <div className="admin-form-grid">
                <Field label="Título" name="title" defaultValue={item.title} />
                <Field label="Botón opcional" name="ctaLabel" defaultValue={item.ctaLabel} />
                <Area label="Mensaje" name="message" defaultValue={item.message} />
                <Field label="Link opcional" name="ctaUrl" defaultValue={item.ctaUrl} />
                <Field label="Posición" name="position" type="number" defaultValue={item.position} />
              </div>
              <div className="admin-actions">
                <Checkbox label="Activo" name="isActive" defaultChecked={item.isActive} />
                <button type="submit" className="admin-secondary">Guardar</button>
                <button formAction={deleteAnnouncementAction} className="admin-danger">Borrar</button>
              </div>
            </form>
          ))}
        </div>
      </section>

      <section id="categorias" className="admin-card">
        <SectionTitle title="Categorías" text="Crea, edita, activa o borra categorías de productos." />

        <details className="admin-details">
          <summary>Crear categoría</summary>
          <form action={saveCategoryAction} className="admin-form">
            <div className="admin-form-grid">
              <Field label="Nombre" name="name" placeholder="Discord" />
              <Field label="Slug opcional" name="slug" placeholder="discord" />
              <Area label="Descripción opcional" name="description" />
              <Field label="Color" name="accentColor" defaultValue="#ff4fa6" />
              <Field label="Posición" name="position" type="number" defaultValue={10} />
            </div>
            <Checkbox label="Activa" name="isActive" defaultChecked />
            <button type="submit" className="admin-primary">Crear categoría</button>
          </form>
        </details>

        <div className="admin-list">
          {data.categories.map((category) => (
            <form key={category.id} action={saveCategoryAction} className="admin-list-item">
              <input type="hidden" name="id" value={category.id} />
              <div className="admin-form-grid">
                <Field label="Nombre" name="name" defaultValue={category.name} />
                <Field label="Slug" name="slug" defaultValue={category.slug} />
                <Area label="Descripción" name="description" defaultValue={category.description} />
                <Field label="Color" name="accentColor" defaultValue={category.accentColor} />
                <Field label="Posición" name="position" type="number" defaultValue={category.position} />
              </div>
              <div className="admin-actions">
                <Checkbox label={`Activa (${category._count.products} productos)`} name="isActive" defaultChecked={category.isActive} />
                <button type="submit" className="admin-secondary">Guardar</button>
                <button formAction={deleteCategoryAction} className="admin-danger">Borrar</button>
              </div>
            </form>
          ))}
        </div>
      </section>

      <section id="productos" className="admin-card">
        <SectionTitle title="Productos" text="Cada producto es una tarjeta individual. Sube imagen, marca vendido o edita datos básicos." />

        <details className="admin-details">
          <summary>Crear producto</summary>
          <form action={saveProductAction} className="admin-form">
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Categoría</span>
                <select name="categoryId" defaultValue={data.categories[0]?.id}>
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Título" name="name" placeholder="Cuenta Minecraft #1" />
              <Field label="Precio USD" name="priceUsd" type="number" step="0.01" placeholder="2.50" />
              <Area label="Nota" name="shortDescription" placeholder="Ejemplo: Full acceso, entrega por ticket." />
              <Area label="Descripción" name="description" placeholder="Detalles visibles en la ventana de compra." />
              <Field label="Imagen principal por URL" name="imageUrl" placeholder="Pega aquí link de Discord si no subes archivo" />
              <Area label="Más imágenes por URL" name="imageUrls" placeholder="Una URL por línea. Se alternan al pasar el mouse." />
              <FileField label="Subir imágenes" name="imageFile" />
            </div>
            <div className="admin-row">
              <Checkbox label="Activo" name="isActive" defaultChecked />
              <Checkbox label="Destacado" name="isFeatured" />
              <Checkbox label="Vendido" name="isSold" />
            </div>
            <button type="submit" className="admin-primary">Crear producto</button>
          </form>
        </details>

        <div className="admin-product-list">
          {data.products.map((product) => (
            <details key={product.id} className="admin-product">
              <summary>
                <div>
                  <span>{product.category.name}</span>
                  <strong>{product.name}</strong>
                </div>
                <div className="admin-product-meta">
                  <em>{product.isSold ? "Vendido" : "Disponible"}</em>
                </div>
              </summary>

              <form action={saveProductAction} className="admin-form">
                <input type="hidden" name="id" value={product.id} />
                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>Categoría</span>
                    <select name="categoryId" defaultValue={product.categoryId}>
                      {data.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label="Título" name="name" defaultValue={product.name} />
                  <Field label="Precio USD" name="priceUsd" type="number" step="0.01" defaultValue={product.priceUsd} />
                  <input type="hidden" name="slug" value={product.slug} />
                  <input type="hidden" name="badge" value={product.badge ?? ""} />
                  <input type="hidden" name="compareAtPrice" value={product.compareAtPrice ?? ""} />
                  <input type="hidden" name="features" value={product.features ?? ""} />
                  <input type="hidden" name="deliveryDetails" value={product.deliveryDetails ?? ""} />
                  <Area label="Nota" name="shortDescription" defaultValue={product.shortDescription} />
                  <Area label="Descripción" name="description" defaultValue={product.description} />
                  <Field label="Imagen principal por URL" name="imageUrl" defaultValue={product.imageUrl} />
                  <Area label="Más imágenes por URL" name="imageUrls" defaultValue={(product.imageUrls ?? []).join("\n")} />
                  <FileField label="Agregar o cambiar imágenes por archivo" name="imageFile" />
                </div>
                <div className="admin-actions">
                  <Checkbox label="Activo" name="isActive" defaultChecked={product.isActive} />
                  <Checkbox label="Destacado" name="isFeatured" defaultChecked={product.isFeatured} />
                  <Checkbox label="Vendido" name="isSold" defaultChecked={product.isSold} />
                  <button type="submit" className="admin-secondary">Guardar</button>
                  <button formAction={deleteProductAction} className="admin-danger">Borrar</button>
                </div>
              </form>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
