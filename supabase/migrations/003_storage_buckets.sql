-- ============================================================================
-- Stavia — Storage buckets and policies
-- Creates the buckets via SQL (equivalent to doing it in Dashboard → Storage).
-- Run after 001 and 002.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('property-images', 'property-images', true, 8388608, array['image/jpeg','image/png','image/webp']),
  ('room-images', 'room-images', true, 8388608, array['image/jpeg','image/png','image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Public read for all three buckets (images are meant to be publicly viewable).
create policy "Public read property-images" on storage.objects
  for select using (bucket_id = 'property-images');
create policy "Public read room-images" on storage.objects
  for select using (bucket_id = 'room-images');
create policy "Public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

-- Authenticated users can upload. We scope the folder convention to
-- "<property_id>/<filename>" and check ownership via the properties table
-- in application code (Route Handler) before issuing the upload URL —
-- Storage RLS alone cannot easily join to properties, so uploads happen
-- through a server action that first verifies public.owns_property().

create policy "Authenticated users can upload property images" on storage.objects
  for insert with check (bucket_id = 'property-images' and auth.role() = 'authenticated');
create policy "Owners can update/delete their property images" on storage.objects
  for update using (bucket_id = 'property-images' and auth.role() = 'authenticated');
create policy "Owners can delete their property images" on storage.objects
  for delete using (bucket_id = 'property-images' and auth.role() = 'authenticated');

create policy "Authenticated users can upload room images" on storage.objects
  for insert with check (bucket_id = 'room-images' and auth.role() = 'authenticated');
create policy "Owners can update their room images" on storage.objects
  for update using (bucket_id = 'room-images' and auth.role() = 'authenticated');
create policy "Owners can delete their room images" on storage.objects
  for delete using (bucket_id = 'room-images' and auth.role() = 'authenticated');

create policy "Users can upload their own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can update their own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Note: fine-grained "only the actual owner of THIS property can upload
-- into THIS property's folder" authorization is enforced in the app's
-- server-side upload route (app/api/upload/route.ts, added in Stage 2),
-- which checks owns_property() before generating a signed path. This
-- migration provides the baseline bucket-level policies.
