-- El logo (bucket "branding") ahora acepta SVG de Illustrator. Los productos
-- siguen siendo solo fotos (jpg/png/webp), no hace falta tocar ese bucket.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
where id = 'branding';
