-- Archivo STEAM — Fase 2
-- 0014 · Acceso a Storage (RLS de storage.objects + límites de bucket)
--
-- Fase 1 creó los buckets pero SIN políticas de storage.objects: el staff no
-- podía subir por API y no había validación de MIME/tamaño. Se cierra aquí.
--   public-media  -> lectura pública; escritura solo staff.
--   private-legal -> lectura y escritura solo staff (jamás anon/member).
-- La validación de MIME y tamaño se hace a nivel de bucket (lista blanca).

-- ── Límites y tipos permitidos por bucket ─────────────────────────────────────
update storage.buckets
  set file_size_limit = 52428800,  -- 50 MB
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','video/mp4']
  where id = 'public-media';

update storage.buckets
  set file_size_limit = 26214400,  -- 25 MB
      allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp']
  where id = 'private-legal';

-- ── public-media: lectura pública, escritura staff ───────────────────────────
drop policy if exists "public_media_read" on storage.objects;
create policy "public_media_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'public-media');

drop policy if exists "public_media_insert" on storage.objects;
create policy "public_media_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'public-media' and public.is_staff());

drop policy if exists "public_media_update" on storage.objects;
create policy "public_media_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-media' and public.is_staff())
  with check (bucket_id = 'public-media' and public.is_staff());

drop policy if exists "public_media_delete" on storage.objects;
create policy "public_media_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'public-media' and public.is_staff());

-- ── private-legal: solo staff (sin anon/member) ──────────────────────────────
drop policy if exists "private_legal_read" on storage.objects;
create policy "private_legal_read" on storage.objects
  for select to authenticated using (bucket_id = 'private-legal' and public.is_staff());

drop policy if exists "private_legal_insert" on storage.objects;
create policy "private_legal_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'private-legal' and public.is_staff());

drop policy if exists "private_legal_update" on storage.objects;
create policy "private_legal_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'private-legal' and public.is_staff())
  with check (bucket_id = 'private-legal' and public.is_staff());

drop policy if exists "private_legal_delete" on storage.objects;
create policy "private_legal_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'private-legal' and public.is_staff());
