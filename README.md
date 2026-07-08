# Smar't shop

Tienda digital estilo Discord shop con frontend público y panel admin para manejar:

- Configuración global de la marca
- Categorías editables
- Productos editables
- Stock por líneas, cuentas o códigos
- Reviews
- FAQ
- Métodos de pago

## Stack

- Next.js 16
- Tailwind CSS 4
- Persistencia local en JSON
- Server Actions
- Auth por cookie firmada

## Arranque local

1. Copia `.env.example` a `.env` y ajusta `AUTH_SECRET`, `DISCORD_URL`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
2. Ejecuta:

```bash
npm install
npm run dev
```

3. Abre `http://localhost:3000`
4. Panel admin: `http://localhost:3000/admin/login`

Credenciales seed por defecto:

- Correo: `admin@smartshop.mx`
- Clave: `SmartsAdmin123!`

Los datos vivos de la tienda se guardan en `data/store.json`. La primera vez que arrancas, el archivo se crea solo con contenido inicial.
En hosting puedes moverlo con `STORE_DATA_PATH`, por ejemplo a un volumen persistente como `/data/store.json`.

## Producción

- Cambia `AUTH_SECRET`
- Cambia `ADMIN_PASSWORD`
- Actualiza `DISCORD_URL`
- Si vas a desplegarlo en un hosting serverless, cambia la persistencia a una base externa. En un VPS o Node server tradicional, el almacenamiento en archivo funciona sin problema.
- Para Railway/Render/Fly conviene montar un volumen y apuntar `STORE_DATA_PATH` ahí para no perder cambios del panel admin.

## Comandos útiles

```bash
npm run dev
npm run build
npm run lint
```
