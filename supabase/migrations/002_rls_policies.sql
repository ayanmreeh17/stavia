-- ============================================================================
-- Stavia — Row Level Security policies
-- Run after 001_initial_schema.sql
-- ============================================================================

-- ── HELPER: is the current user an admin? ───────────────────────────────
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ── HELPER: does the current user own this property? ────────────────────
create or replace function public.owns_property(p_property_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.properties
    where id = p_property_id and owner_id = auth.uid()
  );
$$ language sql security definer stable;

-- ── ENABLE RLS ────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.property_images enable row level security;
alter table public.room_images enable row level security;
alter table public.amenities enable row level security;
alter table public.property_amenities enable row level security;
alter table public.room_amenities enable row level security;
alter table public.categories enable row level security;
alter table public.cities enable row level security;
alter table public.regions_lookup enable row level security;
alter table public.prices enable row level security;
alter table public.seasonal_prices enable row level security;
alter table public.special_offers enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.inquiries enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- ── PROFILES ─────────────────────────────────────────────────────────────

create policy "Profiles are viewable by their owner" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
  -- Note: role changes are blocked here on purpose — only an admin (via
  -- service_role in a server action) may promote a user. See README.

create policy "Admins can update any profile" on public.profiles
  for update using (public.is_admin());

-- ── REFERENCE DATA (public read, admin write) ───────────────────────────

create policy "Categories are public" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all using (public.is_admin());

create policy "Amenities are public" on public.amenities for select using (true);
create policy "Admins manage amenities" on public.amenities for all using (public.is_admin());

create policy "Cities are public" on public.cities for select using (true);
create policy "Admins manage cities" on public.cities for all using (public.is_admin());

create policy "Regions are public" on public.regions_lookup for select using (true);
create policy "Admins manage regions" on public.regions_lookup for all using (public.is_admin());

-- ── PROPERTIES ───────────────────────────────────────────────────────────
-- Public can see only approved properties. Owners see their own regardless
-- of status. Admins see and manage everything.

create policy "Approved properties are public" on public.properties
  for select using (status = 'approved' or owner_id = auth.uid() or public.is_admin());

create policy "Owners can insert their own properties" on public.properties
  for insert with check (owner_id = auth.uid());

create policy "Owners can update their own non-approved edits" on public.properties
  for update using (owner_id = auth.uid() or public.is_admin());

create policy "Owners can delete their own draft properties" on public.properties
  for delete using ((owner_id = auth.uid() and status = 'draft') or public.is_admin());

-- ── ROOMS / IMAGES / AMENITIES (inherit property visibility) ───────────

create policy "Rooms visible if property visible" on public.rooms
  for select using (
    exists (select 1 from public.properties p where p.id = property_id
      and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin()))
  );
create policy "Owners manage their property's rooms" on public.rooms
  for all using (public.owns_property(property_id) or public.is_admin());

create policy "Property images visible if property visible" on public.property_images
  for select using (
    exists (select 1 from public.properties p where p.id = property_id
      and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin()))
  );
create policy "Owners manage their property's images" on public.property_images
  for all using (public.owns_property(property_id) or public.is_admin());

create policy "Room images visible if room visible" on public.room_images
  for select using (
    exists (
      select 1 from public.rooms r join public.properties p on p.id = r.property_id
      where r.id = room_id and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "Owners manage their room images" on public.room_images
  for all using (
    exists (select 1 from public.rooms r where r.id = room_id and public.owns_property(r.property_id))
    or public.is_admin()
  );

create policy "Property amenities visible if property visible" on public.property_amenities
  for select using (
    exists (select 1 from public.properties p where p.id = property_id
      and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin()))
  );
create policy "Owners manage their property amenities" on public.property_amenities
  for all using (public.owns_property(property_id) or public.is_admin());

create policy "Room amenities visible if room visible" on public.room_amenities
  for select using (
    exists (
      select 1 from public.rooms r join public.properties p on p.id = r.property_id
      where r.id = room_id and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "Owners manage their room amenities" on public.room_amenities
  for all using (
    exists (select 1 from public.rooms r where r.id = room_id and public.owns_property(r.property_id))
    or public.is_admin()
  );

-- ── PRICING ──────────────────────────────────────────────────────────────

create policy "Prices visible if property visible" on public.prices
  for select using (
    exists (select 1 from public.properties p where p.id = property_id
      and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin()))
  );
create policy "Owners manage their own pricing" on public.prices
  for all using (public.owns_property(property_id) or public.is_admin());

create policy "Seasonal prices visible if property visible" on public.seasonal_prices
  for select using (
    exists (select 1 from public.properties p where p.id = property_id
      and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin()))
  );
create policy "Owners manage seasonal pricing" on public.seasonal_prices
  for all using (public.owns_property(property_id) or public.is_admin());

create policy "Offers visible if property visible" on public.special_offers
  for select using (
    exists (select 1 from public.properties p where p.id = property_id
      and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin()))
  );
create policy "Owners manage offers" on public.special_offers
  for all using (public.owns_property(property_id) or public.is_admin());

create policy "Availability visible if property visible" on public.availability_blocks
  for select using (
    exists (select 1 from public.properties p where p.id = property_id
      and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin()))
  );
create policy "Owners manage availability" on public.availability_blocks
  for all using (public.owns_property(property_id) or public.is_admin());

-- ── FAVORITES ────────────────────────────────────────────────────────────

create policy "Users manage their own favorites" on public.favorites
  for all using (user_id = auth.uid());

-- ── REVIEWS ──────────────────────────────────────────────────────────────

create policy "Published reviews are public" on public.reviews
  for select using (is_published = true or user_id = auth.uid() or public.is_admin());

create policy "Authenticated users can write a review" on public.reviews
  for insert with check (user_id = auth.uid());

create policy "Users can edit their own review" on public.reviews
  for update using (user_id = auth.uid() or public.is_admin());

create policy "Users or admins can delete a review" on public.reviews
  for delete using (user_id = auth.uid() or public.is_admin());

-- ── INQUIRIES ────────────────────────────────────────────────────────────
-- Anyone (even anonymous) can create an inquiry (contact form). Only the
-- property owner and admins can read them.

create policy "Anyone can submit an inquiry" on public.inquiries
  for insert with check (true);

create policy "Owners and admins view their inquiries" on public.inquiries
  for select using (public.owns_property(property_id) or public.is_admin());

create policy "Owners and admins update inquiry status" on public.inquiries
  for update using (public.owns_property(property_id) or public.is_admin());

-- ── NOTIFICATIONS ────────────────────────────────────────────────────────

create policy "Users see their own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "Users mark their own notifications read" on public.notifications
  for update using (user_id = auth.uid());

-- Note: inserts into notifications happen from trusted server code
-- (service_role), so no public insert policy is created here.

-- ── REPORTS ──────────────────────────────────────────────────────────────

create policy "Authenticated users can file a report" on public.reports
  for insert with check (auth.uid() is not null and reporter_id = auth.uid());

create policy "Admins manage reports" on public.reports
  for all using (public.is_admin());

create policy "Reporters can see their own reports" on public.reports
  for select using (reporter_id = auth.uid() or public.is_admin());
