-- Archivo STEAM — Fase 1 (cimentación)
-- 0007 · Storage base
--
-- public-media  : recursos publicados (imágenes/portadas). Bucket público de lectura.
-- private-legal : autorizaciones y material legal. Privado.
--
-- Escritura CERRADA en ambos (sin políticas de INSERT/UPDATE/DELETE para anon/auth):
-- solo service_role puede subir en Fase 1. Las políticas de escritura del panel
-- se definirán en Fase 2. No se sube material real todavía. No se almacenan
-- videos de entrevistas (viven en YouTube) ni secretos.

insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('private-legal', 'private-legal', false)
on conflict (id) do nothing;
