-- Sabores/variantes por producto (empanadas, tartas, etc). Sin precio propio:
-- es solo una preferencia que viaja en el pedido de WhatsApp. Un producto sin
-- sabores cargados (array vacío) sigue funcionando como antes.
alter table public.products
  add column flavors text[] not null default '{}'::text[];
