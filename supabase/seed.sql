-- ============================================================================
-- Stavia — DEVELOPMENT-ONLY seed data
-- ⚠️ Do NOT run this against your production database.
-- This creates a fake approved property so you have something to click
-- around locally before you've submitted a real listing.
--
-- Run locally with: supabase db reset   (applies migrations + this file)
-- or paste manually into a LOCAL/staging Supabase SQL editor only.
-- ============================================================================

do $$
declare
  demo_owner_id uuid;
  demo_property_id uuid;
  demo_city_id uuid;
begin
  -- Requires an existing auth user to own the demo property.
  -- Replace this email with a real account you've created in your local
  -- Supabase Studio (Authentication → Users → Add user) before running.
  select id into demo_owner_id from public.profiles where email = 'demo-owner@example.com' limit 1;

  if demo_owner_id is null then
    raise notice 'No profile found for demo-owner@example.com — skipping seed. Create that user first via Supabase Studio, or ignore this if you only need reference data.';
    return;
  end if;

  select id into demo_city_id from public.cities where name_he = 'קיסריה' limit 1;

  insert into public.properties (
    id, owner_id, name, slug, description, property_type, country_code,
    region, city_id, address, lat, lng, max_guests, num_rooms, num_beds,
    num_bathrooms, phone, whatsapp_number, status, submitted_at, approved_at
  ) values (
    uuid_generate_v4(), demo_owner_id, 'וילה בוטיק על החוף', 'villa-boutique-caesarea-demo',
    'וילת יוקרה עם בריכה פרטית, נוף לים ועיצוב מודרני. מושלמת לחופשה משפחתית או זוגית.',
    'villa', 'IL', 'center', demo_city_id, 'רחוב הים 12, קיסריה', 32.5000, 34.9000,
    8, 4, 5, 3, '+972501234567', '+972501234567', 'approved', now(), now()
  ) returning id into demo_property_id;

  insert into public.prices (property_id, weekday_price, weekend_price, currency)
  values (demo_property_id, 1200, 1800, 'ILS');

  insert into public.property_amenities (property_id, amenity_id)
  select demo_property_id, id from public.amenities where key in ('pool','private_pool','wifi','ac','parking','kitchen','bbq','garden');

  raise notice 'Seeded demo property %', demo_property_id;
end $$;
