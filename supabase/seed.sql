-- Datos opcionales de demostración. No son necesarios en producción.
-- Es idempotente: al repetirlo conserva cualquier fila ya existente.
insert into public.business_settings(
  id, business_name, description, whatsapp_number, address, opening_hours,
  instagram_url, hero_title, hero_subtitle
)
values(
  '20000000-0000-0000-0000-000000000001',
  'La Cuoca',
  'Cocina artesanal, ingredientes nobles y recetas para compartir.',
  '5491100000000',
  'Av. Siempre Viva 123, Buenos Aires',
  'Lun a sáb · 10 a 20 h',
  'https://instagram.com/',
  'Hecho rico, hecho cerca',
  'Sabores artesanales preparados con tiempo y cariño.'
)
on conflict do nothing;

insert into public.categories(id, name, slug, description, display_order)
values
  ('10000000-0000-0000-0000-000000000001', 'Dulces', 'dulces', 'Para acompañar cada momento.', 1),
  ('10000000-0000-0000-0000-000000000002', 'Salados', 'salados', 'Opciones sabrosas para compartir.', 2),
  ('10000000-0000-0000-0000-000000000003', 'Combos', 'combos', 'Selecciones listas para regalar o disfrutar.', 3)
on conflict do nothing;

insert into public.products(
  id, category_id, name, slug, short_description, description,
  price, available, featured, display_order
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Torta de chocolate', 'torta-de-chocolate', 'Bizcochuelo húmedo con ganache.',
    'Torta artesanal de chocolate intenso, ideal para 8 porciones.', 18500, true, true, 1
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Cheesecake de frutos rojos', 'cheesecake-frutos-rojos', 'Cremoso y fresco.',
    'Base crocante, crema de queso y salsa casera de frutos rojos.', 21000, true, true, 2
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'Cookies artesanales', 'cookies-artesanales', 'Caja de seis unidades.',
    'Cookies de vainilla con abundantes chips de chocolate.', 7800, true, false, 3
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000002',
    'Focaccia de romero', 'focaccia-romero', 'Masa aireada con aceite de oliva.',
    'Fermentación lenta, romero fresco y sal marina.', 6500, true, true, 1
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000002',
    'Tarta caprese', 'tarta-caprese', 'Tomate, albahaca y mozzarella.',
    'Tarta completa para compartir, preparada en el día.', 15000, false, false, 2
  ),
  (
    '30000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000002',
    'Scones de queso', 'scones-queso', 'Docena de scones tiernos.',
    'Con queso estacionado y un toque de pimienta.', 9800, true, false, 3
  ),
  (
    '30000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000003',
    'Merienda para dos', 'merienda-para-dos', 'Dulces, salados e infusiones.',
    'Selección surtida presentada en caja lista para regalar.', 24000, true, true, 1
  ),
  (
    '30000000-0000-0000-0000-000000000008',
    '10000000-0000-0000-0000-000000000003',
    'Box celebración', 'box-celebracion', 'Una caja completa para festejar.',
    'Mini torta, cookies, scones y tarjeta personalizada.', 32000, true, false, 2
  )
on conflict do nothing;
