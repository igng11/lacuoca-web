-- Carga inicial del catálogo real de La Cuoca.
-- Diseñado para ejecutarse manualmente desde Supabase SQL Editor.
--
-- Estrategia de idempotencia:
--   * categorías: upsert por slug; conserva una descripción existente;
--   * productos: upsert por slug; actualiza los datos del catálogo real;
--   * imágenes: no se insertan ni se eliminan; un image_url existente se conserva.
--
-- Este archivo no elimina datos, usuarios, perfiles, configuración, objetos de
-- Storage ni políticas RLS. Los UUID nuevos los genera PostgreSQL mediante el
-- default gen_random_uuid() definido en el esquema.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

insert into public.categories (
  name,
  slug,
  description,
  active,
  display_order
)
values
  ('Empanadas', 'empanadas', null, true, 10),
  ('Tortillas', 'tortillas', null, true, 20),
  ('Tartas', 'tartas', null, true, 30),
  ('Platos preparados', 'platos-preparados', null, true, 40),
  ('Festejos', 'festejos', null, true, 50),
  ('Ensaladas', 'ensaladas', null, true, 60)
on conflict (slug) do update
set
  name = excluded.name,
  active = excluded.active,
  display_order = excluded.display_order;

insert into public.products (
  category_id,
  name,
  slug,
  short_description,
  description,
  price,
  available,
  featured,
  active,
  display_order
)
values
  (
    (select id from public.categories where slug = 'empanadas'),
    'Empanadas al horno',
    'empanadas-al-horno',
    'Sabores disponibles. El precio corresponde a una unidad.',
    $description$Sabores disponibles:

Carne clásica
Carne a cuchillo
Cebolla y mozzarella
Humita
Pollo
Bondiola
Jamón y mozzarella
Caprese
Verdura y salsa blanca
Calabaza y roquefort

El precio corresponde a una unidad.$description$,
    3500.00,
    true,
    false,
    true,
    10
  ),
  (
    (select id from public.categories where slug = 'empanadas'),
    'Empanadas fritas',
    'empanadas-fritas',
    'Disponibles los viernes. El precio corresponde a una unidad.',
    $description$Disponibles los viernes.

Sabores:

Carne clásica
Carne a cuchillo
Pollo
Jamón y queso
Bondiola

El precio corresponde a una unidad.$description$,
    3500.00,
    true,
    false,
    true,
    20
  ),
  (
    (select id from public.categories where slug = 'tortillas'),
    'Tortillas caseras',
    'tortillas-caseras',
    'Variedades de papa, papa y cebolla, y acelga con zanahoria.',
    $description$Variedades:

Papa
Papa y cebolla
Acelga y zanahoria$description$,
    9500.00,
    true,
    false,
    true,
    10
  ),
  (
    (select id from public.categories where slug = 'tartas'),
    'Tartas caseras',
    'tartas-caseras',
    'Consultá cuáles hay disponibles.',
    $description$Consultá cuáles hay disponibles.

Variedades habituales:

Mozzarella y cebolla
Tomate y mozzarella
Ricota, jamón y mozzarella
Calabaza
Zapallitos
Acelga y salsa blanca
Verdeo y zanahoria
Mix de vegetales$description$,
    11000.00,
    true,
    false,
    true,
    10
  ),
  (
    (select id from public.categories where slug = 'platos-preparados'),
    'Locro',
    'locro',
    'Congelado, presentación de 600 g.',
    $description$Congelado, presentación de 600 g.$description$,
    20000.00,
    true,
    false,
    true,
    10
  ),
  (
    (select id from public.categories where slug = 'platos-preparados'),
    'Plato del día',
    'plato-del-dia',
    'Consultá cuál es el plato disponible del día.',
    $description$Consultá cuál es el plato disponible del día.$description$,
    18000.00,
    true,
    false,
    true,
    20
  ),
  (
    (select id from public.categories where slug = 'platos-preparados'),
    'Goulash con spaetzle',
    'goulash-con-spaetzle',
    'Disponible únicamente los jueves.',
    $description$Disponible únicamente los jueves.$description$,
    20000.00,
    true,
    false,
    true,
    30
  ),
  (
    (select id from public.categories where slug = 'platos-preparados'),
    'Pata y muslo al horno con guarnición',
    'pata-y-muslo-al-horno-con-guarnicion',
    null,
    null,
    16000.00,
    true,
    false,
    true,
    40
  ),
  (
    (select id from public.categories where slug = 'festejos'),
    'Armá tu festejo',
    'arma-tu-festejo',
    'Pedido con 48 horas de anticipación.',
    $description$Pedido con 48 horas de anticipación.

Incluye:

Bondiola, ternerita o pollo braseado
Bandeja de 500 g
Rinde aproximadamente 12 figacitas
12 figacitas de manteca
Dips de salsa criolla, alioli y barbacoa$description$,
    45000.00,
    true,
    false,
    true,
    10
  ),
  (
    (select id from public.categories where slug = 'ensaladas'),
    'Ensaladas',
    'ensaladas',
    'Consultá las variedades disponibles.',
    $description$Consultá las variedades disponibles.$description$,
    9000.00,
    true,
    false,
    true,
    10
  )
on conflict (slug) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  available = excluded.available,
  featured = excluded.featured,
  active = excluded.active,
  display_order = excluded.display_order;

commit;

-- Verificación: debe devolver 10 filas, con sus 6 categorías y precios.
select
  c.name as category,
  c.display_order as category_order,
  p.name as product,
  p.slug,
  p.price,
  p.active,
  p.available,
  p.display_order as product_order
from public.products p
join public.categories c on c.id = p.category_id
where p.slug in (
  'empanadas-al-horno',
  'empanadas-fritas',
  'tortillas-caseras',
  'tartas-caseras',
  'locro',
  'plato-del-dia',
  'goulash-con-spaetzle',
  'pata-y-muslo-al-horno-con-guarnicion',
  'arma-tu-festejo',
  'ensaladas'
)
order by c.display_order, p.display_order, p.name;
