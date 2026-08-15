-- ============================================================================
-- Stavia — Initial schema
-- Run this in Supabase SQL Editor, or via `supabase db push` (see README).
-- ============================================================================

create extension if not exists "uuid-ossp";
-- Note: lat/lng are stored as plain double precision columns for simplicity.
-- If you later need radius/geo queries, enable the "postgis" extension from
-- Supabase Dashboard → Database → Extensions and migrate these to geography(Point).

-- ── ENUMS ────────────────────────────────────────────────────────────────

create type user_role as enum ('user', 'owner', 'admin');

create type property_status as enum (
  'draft', 'pending', 'approved', 'rejected', 'needs_changes', 'suspended'
);

create type property_type as enum (
  'villa', 'cabin', 'apartment', 'cottage', 'farmhouse', 'boutique_hotel',
  'guesthouse', 'zimmer', 'unique_stay', 'other'
);

create type region as enum ('north', 'center', 'south', 'other');

create type inquiry_status as enum ('new', 'read', 'replied', 'closed');

create type notification_type as enum (
  'property_submitted', 'property_approved', 'property_rejected',
  'changes_requested', 'new_inquiry', 'account_security', 'new_review'
);

create type report_status as enum ('open', 'reviewed', 'dismissed', 'actioned');

-- ── PROFILES (extends auth.users) ───────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  phone_country_code text default '+972',
  role user_role not null default 'user',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per auth.users row. role=admin grants full access — see setup instructions in README for how to assign it.';

-- ── LOCATION REFERENCE TABLES ───────────────────────────────────────────

create table public.regions_lookup (
  id uuid primary key default uuid_generate_v4(),
  key region not null unique,
  name_he text not null,
  name_en text
);

create table public.cities (
  id uuid primary key default uuid_generate_v4(),
  name_he text not null,
  name_en text,
  region region,
  country_code text not null default 'IL',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_cities_region on public.cities(region);
create index idx_cities_country on public.cities(country_code);

-- ── CATEGORIES & AMENITIES ──────────────────────────────────────────────

create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  name_he text not null,
  name_en text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.amenities (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  name_he text not null,
  name_en text,
  icon text,
  "group" text not null default 'general', -- e.g. 'pool', 'kitchen', 'outdoor'
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- ── PROPERTIES ───────────────────────────────────────────────────────────

create table public.properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,

  name text not null,
  slug text unique,
  description text,
  property_type property_type not null default 'other',
  category_id uuid references public.categories(id),

  country_code text not null default 'IL',
  region region,
  city_id uuid references public.cities(id),
  address text,
  address_visible boolean not null default true, -- if false, only approx_lat/lng shown publicly
  lat double precision,
  lng double precision,
  approx_lat double precision,
  approx_lng double precision,

  max_guests int not null default 1,
  num_rooms int not null default 1,
  num_beds int not null default 1,
  num_bathrooms numeric(3,1) not null default 1,

  cover_image_url text,

  phone text,
  phone_country_code text default '+972',
  whatsapp_number text,
  contact_email text,

  status property_status not null default 'draft',
  rejection_reason text,
  admin_notes text,

  is_featured boolean not null default false,
  view_count int not null default 0,

  seo_title text,
  seo_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_at timestamptz
);

create index idx_properties_owner on public.properties(owner_id);
create index idx_properties_status on public.properties(status);
create index idx_properties_city on public.properties(city_id);
create index idx_properties_region on public.properties(region);
create index idx_properties_type on public.properties(property_type);
create index idx_properties_featured on public.properties(is_featured) where is_featured = true;
create index idx_properties_slug on public.properties(slug);

-- ── ROOMS ────────────────────────────────────────────────────────────────

create table public.rooms (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  room_type text, -- 'bedroom' | 'living_room' | 'kitchen' | 'bathroom' | 'other'
  description text,
  num_beds int not null default 1,
  bed_types text[], -- e.g. ARRAY['queen','single']
  bathroom_info text,
  size_sqm numeric(6,1),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_rooms_property on public.rooms(property_id);

-- ── IMAGES ───────────────────────────────────────────────────────────────

create table public.property_images (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null, -- path within the 'property-images' storage bucket
  alt_text text,
  is_cover boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_property_images_property on public.property_images(property_id);

create table public.room_images (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  storage_path text not null, -- path within the 'room-images' storage bucket
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_room_images_room on public.room_images(room_id);

-- ── AMENITIES JOIN TABLES ────────────────────────────────────────────────

create table public.property_amenities (
  property_id uuid not null references public.properties(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

create table public.room_amenities (
  room_id uuid not null references public.rooms(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (room_id, amenity_id)
);

-- ── PRICING ──────────────────────────────────────────────────────────────
-- Simple weekday/weekend price now; architecture below leaves room for
-- seasonal/holiday pricing, min stays, fees, and offers without a rewrite.

create table public.prices (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  weekday_price numeric(10,2) not null,
  weekend_price numeric(10,2) not null,
  currency text not null default 'ILS',
  min_stay_nights int not null default 1,
  cleaning_fee numeric(10,2) default 0,
  additional_guest_fee numeric(10,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id)
);

-- Future: seasonal/holiday overrides and special offers.
create table public.seasonal_prices (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  label text not null, -- e.g. 'Passover', 'Summer high season'
  start_date date not null,
  end_date date not null,
  weekday_price numeric(10,2),
  weekend_price numeric(10,2),
  min_stay_nights int,
  created_at timestamptz not null default now()
);

create index idx_seasonal_prices_property on public.seasonal_prices(property_id);

create table public.special_offers (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  title text not null,
  description text,
  discount_percent numeric(5,2),
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Future: availability calendar for reservation sync (Airbnb etc.)
create table public.availability_blocks (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  source text not null default 'manual', -- 'manual' | 'airbnb' | 'booking' | ...
  note text,
  created_at timestamptz not null default now()
);

create index idx_availability_property on public.availability_blocks(property_id);

-- ── FAVORITES ────────────────────────────────────────────────────────────

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- ── REVIEWS ──────────────────────────────────────────────────────────────

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  cleanliness_rating smallint check (cleanliness_rating between 1 and 5),
  location_rating smallint check (location_rating between 1 and 5),
  facilities_rating smallint check (facilities_rating between 1 and 5),
  service_rating smallint check (service_rating between 1 and 5),
  value_rating smallint check (value_rating between 1 and 5),
  comment text,
  is_verified boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique(property_id, user_id)
);

create index idx_reviews_property on public.reviews(property_id);

-- ── INQUIRIES ────────────────────────────────────────────────────────────

create table public.inquiries (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  message text not null,
  check_in date,
  check_out date,
  guests int,
  status inquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

create index idx_inquiries_property on public.inquiries(property_id);
create index idx_inquiries_owner_lookup on public.inquiries(property_id, status);

-- ── NOTIFICATIONS ────────────────────────────────────────────────────────

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  related_property_id uuid references public.properties(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, is_read);

-- ── REPORTS (content moderation) ────────────────────────────────────────

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id) on delete set null,
  property_id uuid references public.properties(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete cascade,
  reason text not null,
  details text,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

create index idx_reports_status on public.reports(status);

-- ── UPDATED_AT TRIGGER HELPER ───────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();
create trigger trg_rooms_updated_at before update on public.rooms
  for each row execute function public.set_updated_at();
create trigger trg_prices_updated_at before update on public.prices
  for each row execute function public.set_updated_at();

-- ── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────────────────
-- Every new auth.users row automatically gets a matching profiles row.
-- If the signup email matches ADMIN_EMAIL (set via app config, see below),
-- the app promotes that profile to role='admin' after creation — see
-- README "Creating the first administrator account".

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
