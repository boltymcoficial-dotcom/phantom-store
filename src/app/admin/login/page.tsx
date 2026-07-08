import Image from "next/image";
import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { getSession } from "@/lib/auth";



type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main className="admin-login admin-clean">
      <section className="admin-login-shell">
        <div className="admin-login-brand">
          <Image alt="Phantom store logo" src="/ballen.png" width={96} height={96} priority />
          <div>
            <p className="admin-eyebrow">Panel privado</p>
            <h1>Phantom store</h1>
            <p>Administra productos, stock, FAQ, reviews y enlaces de la tienda.</p>
          </div>
        </div>

        <form action={loginAction} className="admin-login-card" autoComplete="off">
          <div>
            <p className="admin-eyebrow">Acceso seguro</p>
            <h2>Entrar al panel</h2>
            <p>Ingresa tus credenciales. Nada viene escrito por defecto.</p>
          </div>

          {params.error ? <div className="admin-alert">{params.error}</div> : null}

          <label>
            <span>Correo</span>
            <input name="email" type="email" required autoComplete="off" placeholder="Correo de administrador" />
          </label>

          <label>
            <span>Contraseña</span>
            <input name="password" type="password" required autoComplete="new-password" placeholder="Tu contraseña" />
          </label>

          <button type="submit">Entrar</button>

          <p className="admin-login-note">Después de entrar irás a /admin para editar la tienda.</p>
        </form>
      </section>
    </main>
  );
}
