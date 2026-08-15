# La Cuoca — catálogo web

Catálogo público de comidas + panel de administración. Español rioplatense en toda la UI y en los mensajes de error.

## Stack

- **Next.js 16** (App Router, Server Components por defecto) + **React 19** + **TypeScript**
- **Supabase** (Postgres + Auth + Storage) vía `@supabase/ssr`
- **Tailwind v4** (`@import "tailwindcss"` en `globals.css`, sin `tailwind.config`) + CSS custom properties y clases utilitarias propias
- **Zod v4** para validación, **Vitest** para tests, **lucide-react** para íconos
- Node >= 22.13 < 23

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm run build      # build de producción
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run test       # vitest run
```

Antes de dar por terminado un cambio: `npm run typecheck` y `npm run lint`.

## Estructura

```
src/
  app/
    page.tsx                  # home
    catalogo/                 # listado público
    producto/[slug]/          # detalle público
    login/                    # auth (actions.ts + page.tsx)
    admin/                    # panel: productos, categorias, configuracion
      actions.ts              # TODAS las server actions del admin
    globals.css               # design tokens + utilidades (archivo grande, único)
  components/
    public/                   # UI del sitio público
    admin/                    # UI del panel
  services/catalog.ts         # ÚNICO punto de lectura de datos públicos
  lib/
    supabase/{client,server,admin,proxy}.ts
    validation/schemas.ts     # esquemas Zod
    forms.ts storage.ts format.ts whatsapp.ts env.ts color.ts image-validation.ts
  types/database.ts           # tipos de las tablas
```

## Convenciones

**Datos.** Toda lectura pública pasa por `src/services/catalog.ts`. No consultar Supabase directamente desde una página. Cada función chequea `hasSupabaseEnv()` y devuelve un fallback (`defaultSettings`, array vacío) si no hay env — el sitio tiene que renderizar sin backend.

**Sanitización.** `catalog.ts` sanea lo que sale de la base: colores hex, código de moneda, URLs http(s), y valida que las URLs de imágenes pertenezcan al bucket correcto (`storagePathFromPublicUrl`). Cualquier campo nuevo que venga de la DB y termine en un atributo HTML debe pasar por ahí.

**Server actions.** Viven en `src/app/admin/actions.ts` y `src/app/login/actions.ts`. Patrón fijo:
1. `await requireAdmin()` (o `createClient()` para lo público)
2. parsear el `FormData` con el esquema Zod correspondiente usando los helpers de `lib/forms.ts` (`formString`, `formBoolean`)
3. en error → `adminRedirect(path, mensaje, "error")`
4. en éxito → `revalidatePath(...)` y `adminRedirect(path, mensaje)`

El feedback al usuario viaja por query string (`?ok=` / `?error=`) y lo renderiza `components/admin/feedback.tsx`.

**Imágenes.** Subida y borrado siempre por `lib/storage.ts`. Buckets: `products` y `branding`. Al reemplazar una imagen se borra la anterior, pero un fallo en esa limpieza nunca debe hacer fallar el guardado (deja un huérfano y sigue).

**Estilos.** Los tokens (`--primary`, `--paper`, `--ink`, `--radius-*`, fuentes) están en `:root` de `globals.css`. Reutilizar las clases existentes (`.btn`, `.btn-primary`, `.card`, `.input`, `.field`, `.stack`, `.container`, `.grid-cards`, `.eyebrow`) antes de escribir CSS nuevo. Tailwind está disponible pero el grueso del sitio público usa estas clases propias.

**Identidad visual.** Rojo `#e1303d` sobre crema `#f9f4e2`, azul `#1188A8` como acento. Sin sombras (`--shadow-*: none`) — la separación es por borde y contraste. Tipografías: `--font-title` (Mission) para títulos y botones, `--font-body` (Fushia) para el cuerpo.

**Accesibilidad.** Los estilos de `:focus-visible` ya están definidos globalmente; no los pisar. Los botones destructivos usan `components/admin/confirm-button.tsx`.

## Notas

- Los assets de marca sin procesar viven en `src/assets/img/` y `docs/` con nombres tipo `Recurso N@3x.png`; lo servido públicamente va en `public/img/`.
- `src/proxy.ts` + `lib/supabase/proxy.ts` manejan el refresh de sesión; tocar con cuidado.
- No hay migraciones versionadas en el repo: el esquema real vive en Supabase y `src/types/database.ts` es la fuente de verdad para el código.
