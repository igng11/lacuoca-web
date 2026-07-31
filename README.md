# La Cuoca — catálogo gastronómico autoadministrable

Aplicación mobile-first para publicar productos, categorías e información comercial de un único negocio. Los visitantes consultan el catálogo y contactan por WhatsApp. No incluye carrito, pedidos, pagos, inventario, multiempresa ni CRM.

## Alcance

- Inicio, catálogo filtrable y detalle de producto.
- Disponibilidad, destacados, precios opcionales y enlaces de WhatsApp.
- Panel protegido en `/admin`.
- CRUD de productos y categorías.
- Configuración de identidad, portada, contacto, moneda y estado abierto/cerrado.
- Imágenes públicas en Supabase Storage con escritura administrativa.
- Metadata, Open Graph, sitemap, robots, 404 y estados vacíos/error.

## Versiones verificadas

- Node.js `>=22.13.0 <23` y npm 10.
- Next.js 16.2, React 19.2, TypeScript 5, Tailwind CSS 4 y ESLint 9.
- Supabase PostgreSQL, Auth, Storage, `@supabase/ssr` y `@supabase/supabase-js`.

Next.js 16 requiere como mínimo Node 20.9 y utiliza React 19.2 en App Router. Este proyecto fija Node 22 porque es la línea configurada en Netlify y actualmente recibe soporte LTS. Referencias: [Next.js 16](https://nextjs.org/blog/next-16), [instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation) y [versiones de Node.js](https://nodejs.org/en/about/previous-releases).

## Instalación local

```powershell
git clone <URL_DEL_REPOSITORIO>
Set-Location lacuoca-web
npm ci
Copy-Item .env.example .env.local
npm run dev
```

En macOS/Linux, usar `cp .env.example .env.local`. Abrir `http://localhost:3000`.

Sin credenciales reales de Supabase, el sitio muestra una configuración de ejemplo vacía y el login queda deshabilitado. No se simulan datos ni una conexión exitosa.

## Variables de entorno

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Los dos primeros valores se obtienen en **Supabase → Project Settings → API**. En proyectos con terminología anterior, la publishable key puede aparecer como `anon public`. `NEXT_PUBLIC_SITE_URL` debe ser el origen completo, sin ruta; en producción debe usar HTTPS.

La publishable key está diseñada para llegar al navegador y su seguridad depende de RLS. No agregar `service_role`, contraseñas de base, tokens personales ni secretos a variables `NEXT_PUBLIC_*`.

## Configurar Supabase desde cero

1. Crear un proyecto en Supabase.
2. Abrir **SQL Editor**, copiar y ejecutar [`supabase/migrations/202607300001_initial_schema.sql`](supabase/migrations/202607300001_initial_schema.sql).
3. En **Authentication → Sign In / Providers**, desactivar **Allow new users to sign up**. La aplicación no ofrece registro y tampoco concede permisos a usuarios sin perfil autorizado, pero desactivar altas evita cuentas inútiles.
4. En **Authentication → URL Configuration**, definir la URL del sitio y agregar `http://localhost:3000/**` para desarrollo y el dominio HTTPS definitivo para producción.
5. Copiar la URL y la publishable key a `.env.local`.
6. Reiniciar el servidor de desarrollo.

La migración crea tablas, restricciones, índices, triggers, RLS y los buckets públicos `products` y `branding`. Cada bucket limita archivos a 4 MB y admite únicamente MIME JPG, PNG o WebP. Las imágenes se sirven públicamente por URL; listar metadata o escribir/eliminar objetos requiere un administrador autorizado.

### Seed opcional

Ejecutar [`supabase/seed.sql`](supabase/seed.sql) desde SQL Editor sólo si se quieren datos demostrativos. El seed usa identificadores estables y `ON CONFLICT DO NOTHING`: repetirlo no duplica ni sobrescribe filas existentes. No es necesario en producción.

### Crear un administrador

1. En **Authentication → Users → Add user → Create new user**, crear el usuario con email confirmado y contraseña segura.
2. Copiar su UUID.
3. Ejecutar en SQL Editor, reemplazando los valores:

```sql
insert into public.profiles (id, email, display_name)
values ('UUID_DEL_USUARIO', 'admin@ejemplo.com', 'Administrador');
```

La fila en `profiles` es la lista explícita de administradores. Una sesión de Auth sin esa fila no puede entrar al panel ni escribir en tablas o Storage, incluso invocando directamente Server Actions o la API de Supabase.

Limitación deliberada: no existen roles diferenciados. Todo usuario autenticado y autorizado mediante `profiles` tiene acceso administrativo total. Para revocar acceso sin borrar el usuario:

```sql
delete from public.profiles where id = 'UUID_DEL_USUARIO';
```

## Scripts

```powershell
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

`npm start` requiere haber ejecutado `npm run build`.

## Arquitectura

```text
src/
├── app/
│   ├── admin/                 # panel y Server Actions
│   ├── catalogo/              # catálogo público
│   ├── login/                 # autenticación sin registro
│   ├── producto/[slug]/       # detalle público
│   ├── error.tsx              # error dentro de rutas
│   └── global-error.tsx       # error del layout o servicio de datos
├── components/
│   ├── admin/
│   └── public/
├── lib/
│   ├── supabase/              # browser, servidor, sesión y autorización
│   ├── validation/            # esquemas Zod
│   ├── storage.ts             # validación y ciclo de vida de imágenes
│   └── whatsapp.ts
├── services/catalog.ts        # consultas del dominio
└── types/database.ts
supabase/
├── migrations/
└── seed.sql
tests/
└── core.test.ts
```

Las páginas son Server Components salvo controles que necesitan estado del navegador. Las mutaciones se ejecutan como Server Actions, validan datos y vuelven a quedar limitadas por restricciones y RLS. La autorización no depende de ocultar botones.

## Imágenes

- El cliente limita selección a JPG, PNG o WebP y muestra una vista previa.
- La interfaz, Server Actions, el servidor y Storage usan un límite único de 4 MB. El servidor verifica MIME y firma binaria, y genera un nombre UUID con extensión derivada del contenido declarado.
- Al reemplazar una imagen, primero se carga la nueva, luego se confirma la escritura de base y recién entonces se intenta borrar la anterior.
- Si la escritura de base falla, se intenta borrar la carga nueva para evitar huérfanos.
- Al eliminar un producto, la URL a borrar se lee desde la base, no desde un campo oculto manipulable.
- Si falta una imagen, se usa `public/placeholder.svg`.
- `next/image` acepta sólo el hostname exacto configurado en `NEXT_PUBLIC_SUPABASE_URL` y la ruta pública de Storage.

No hay compresión, recorte ni análisis antivirus. Una interrupción durante una operación compensatoria todavía puede dejar un objeto huérfano; conviene revisar periódicamente los buckets contra las URLs guardadas en la base.

## Despliegue en Netlify

Netlify soporta App Router, SSR, Server Actions, revalidación e Image Optimization de Next.js mediante su adaptador OpenNext automático. No hace falta agregar un adaptador manual. Referencias: [Next.js en Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) y [configuración de frameworks](https://docs.netlify.com/frameworks/).

1. Subir el repositorio a un proveedor Git.
2. En Netlify, elegir **Add new project → Import an existing project**.
3. Confirmar `npm run build` como build command y `.next` como publish directory. `netlify.toml` ya fija esos valores y Node 22.
4. Agregar las tres variables de entorno con valores de producción.
5. Desplegar.
6. Copiar la URL HTTPS final a `NEXT_PUBLIC_SITE_URL`.
7. Agregar esa URL en **Supabase → Authentication → URL Configuration**.
8. Lanzar un nuevo deploy y verificar `/`, `/catalogo`, `/login`, la redirección de `/admin` y una carga/reemplazo/eliminación de imagen autenticada.

### Dominio propio

1. Agregar el dominio en **Netlify → Domain management**.
2. Configurar en el proveedor DNS exactamente los registros que Netlify muestre y esperar la emisión del certificado.
3. Actualizar `NEXT_PUBLIC_SITE_URL` con `https://dominio.example`.
4. Actualizar Site URL/Redirect URLs en Supabase.
5. Volver a desplegar y comprobar `robots.txt`, `sitemap.xml`, login y enlaces canónicos.

## Copias de seguridad y restauración

Supabase ofrece backups desde **Database → Backups** según el plan. Los proyectos Free deben hacer exportaciones lógicas periódicas; la documentación oficial recomienda `supabase db dump`. Referencias: [Database Backups](https://supabase.com/docs/guides/platform/backups) y [backup/restauración con CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).

Procedimiento mínimo:

1. Antes de una migración o carga masiva, confirmar que existe un backup reciente o generar un dump lógico y guardarlo fuera de Supabase.
2. Descargar por separado las imágenes importantes de `products` y `branding`: los backups de PostgreSQL guardan metadata de Storage, no los objetos.
3. Para una restauración administrada, elegir en **Database → Backups** un punto anterior al incidente, programar la indisponibilidad y ejecutar **Restore**.
4. Al terminar, verificar `categories`, `products`, `business_settings`, usuarios Auth y `profiles`.
5. Restaurar o volver a subir objetos faltantes de Storage y comprobar las URLs del catálogo.
6. Ejecutar typecheck, pruebas y build de esta versión, desplegar y hacer la verificación funcional.

Una restauración completa hacia otro proyecto también exige volver a configurar Auth, claves, URLs y Storage. No asumir que restaurar PostgreSQL recupera archivos borrados.

## Cambiar identidad y datos

Entrar a `/admin/configuracion` para cambiar nombre, descripción, logo, imagen principal, WhatsApp, dirección, horarios, Instagram, colores, textos de portada, moneda, visibilidad de precios y estado abierto/cerrado. Productos y categorías se administran en sus secciones respectivas. Si no existe `business_settings`, la web sigue operativa con valores seguros de respaldo.

## Seguridad y límites

- RLS permite a visitantes leer sólo categorías activas, productos activos dentro de categorías activas y configuración pública.
- Usuarios sin `profiles` no administran tablas ni Storage.
- Los buckets son públicos porque las imágenes forman parte del catálogo; las escrituras siguen protegidas.
- No existe registro público en la aplicación. También debe quedar desactivado en Supabase.
- Los colores sólo aceptan hexadecimal de seis dígitos; Instagram sólo acepta HTTP(S); WhatsApp se normaliza a dígitos; la moneda exige tres letras.
- Las categorías usadas no pueden borrarse (`ON DELETE RESTRICT`).
- No hay papelera, historial de cambios, auditoría de acciones, compresión de imágenes ni inventario.
- Disponibilidad significa sólo visibilidad comercial; no reserva unidades.
- La aplicación es de un solo negocio.
