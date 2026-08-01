-- CONSULTA OPCIONAL: NO EJECUTAR SIN REVISIÓN Y CONFIRMACIÓN PREVIA.
--
-- Retira exclusivamente los 8 productos y 3 categorías conocidos del seed demo.
-- Cada producto debe coincidir simultáneamente por UUID, slug y nombre.
-- Una categoría demo sólo se elimina si, después de retirar esos productos,
-- no contiene ningún otro producto. No toca business_settings, usuarios,
-- perfiles, Storage, políticas RLS ni ninguna fila fuera de esta lista.

begin;

delete from public.products
where (id, slug, name) in (
  ('30000000-0000-4000-8000-000000000001'::uuid, 'torta-de-chocolate', 'Torta de chocolate'),
  ('30000000-0000-4000-8000-000000000002'::uuid, 'cheesecake-frutos-rojos', 'Cheesecake de frutos rojos'),
  ('30000000-0000-4000-8000-000000000003'::uuid, 'cookies-artesanales', 'Cookies artesanales'),
  ('30000000-0000-4000-8000-000000000004'::uuid, 'focaccia-romero', 'Focaccia de romero'),
  ('30000000-0000-4000-8000-000000000005'::uuid, 'tarta-caprese', 'Tarta caprese'),
  ('30000000-0000-4000-8000-000000000006'::uuid, 'scones-queso', 'Scones de queso'),
  ('30000000-0000-4000-8000-000000000007'::uuid, 'merienda-para-dos', 'Merienda para dos'),
  ('30000000-0000-4000-8000-000000000008'::uuid, 'box-celebracion', 'Box celebración')
);

delete from public.categories c
where (c.id, c.slug, c.name) in (
  ('10000000-0000-4000-8000-000000000001'::uuid, 'dulces', 'Dulces'),
  ('10000000-0000-4000-8000-000000000002'::uuid, 'salados', 'Salados'),
  ('10000000-0000-4000-8000-000000000003'::uuid, 'combos', 'Combos')
)
and not exists (
  select 1
  from public.products p
  where p.category_id = c.id
);

commit;
