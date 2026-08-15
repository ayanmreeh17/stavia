# Stavia · סטאביה — Setup Guide

Full-stack accommodation marketplace: Next.js 14 (App Router, TypeScript) + Supabase (Postgres, Auth, Storage). Everything user-generated lives in Supabase — nothing real is hardcoded in source.

This guide covers items 1–18 from the build spec. Follow it top to bottom the first time.

---

## 1. Project structure (so far — grows in later stages)

```
stavia/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── callback/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # homepage
├── components/
│   ├── auth/ (AuthCard, LoginForm, RegisterForm)
│   ├── home/ (Hero, SearchBar, Categories, FeaturedProperties, Destinations, AmenitiesStrip, MapPreviewSection, OwnerCTA)
│   ├── layout/ (Header, Footer, MobileNav, LanguageSwitch)
│   ├── properties/ (PropertyCard)
│   └── ui/ (Button, PasswordField)
├── lib/
│   ├── actions/auth.ts            # server actions: register/login/logout/reset
│   ├── supabase/ (client.ts, server.ts, middleware.ts)
│   ├── validations/auth.ts        # zod schemas + password rules
│   └── utils.ts
├── types/database.types.ts
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_storage_buckets.sql
│   │   └── 004_reference_data.sql
│   └── seed.sql                   # DEV-ONLY fake property, not run in prod
├── middleware.ts
├── .env.example
├── package.json
├── tailwind.config.ts
└── next.config.js
```

## 2. Prerequisites

- Node.js 18.18+ and npm
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)
- No map account needed — the map runs on free OpenStreetMap tiles via MapLibre out of the box (see section on "Map provider" below for why, and how to upgrade later)

## 3. Create the Supabase project

1. Go to https://supabase.com/dashboard → **New project**.
2. Choose an org, name it `stavia`, set a strong database password (save it somewhere safe — you won't need it day-to-day since we use the API keys, but you'll want it for direct DB access).
3. Pick a region close to your users (e.g. `eu-central-1` for Israel/Europe).
4. Wait ~2 minutes for provisioning.

## 4. Create the database (run the migrations)

**Option A — SQL Editor (simplest, no CLI needed):**
1. In your Supabase project, open **SQL Editor**.
2. Open `supabase/migrations/001_initial_schema.sql` from this project, paste the entire contents, click **Run**.
3. Repeat in order for `002_rls_policies.sql`, `003_storage_buckets.sql`, `004_reference_data.sql`.
4. Do **not** run `supabase/seed.sql` in production — it's dev-only fake data (see the warning at the top of that file).

**Option B — Supabase CLI (better for ongoing development):**
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF   # found in Project Settings → General
supabase db push                                # applies all migrations in order
```

## 5. Storage buckets

Migration `003_storage_buckets.sql` already creates the three buckets (`property-images`, `room-images`, `avatars`) with public-read policies. Nothing extra to do — but you can verify in **Storage** in the dashboard that all three appear.

## 6. Get your API keys

In **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ never expose this to the browser, never prefix with `NEXT_PUBLIC_`, never commit it)

## 7. Configure environment variables locally

```bash
cp .env.example .env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — from step 6
- `ADMIN_EMAIL` — the email address you intend to make administrator (see step 9)
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` locally, your real domain in production
- Nothing needed for the map — see "Map provider" below

## Map provider — why there's no Mapbox key

Mapbox's free tier requires a credit card on file even though usage itself can stay $0 — a reasonable thing to want to avoid for a project you're just getting started with. So the map in this project runs on **MapLibre GL JS** (an open-source, API-compatible fork of Mapbox's own library) using **free OpenStreetMap tiles**. No account, no card, no key — it just works the moment you run `npm run dev`.

The only tradeoff: OpenStreetMap's public tile server is meant for light-to-moderate traffic, not high-volume production use (see their [tile usage policy](https://operations.osmfoundation.org/policies/tiles/)). If Stavia later gets serious traffic, upgrading is a one-file change:
1. Pick a paid tile provider (Mapbox, MapTiler, Stadia Maps all have straightforward pricing).
2. Edit `lib/mapStyle.ts` — swap the `tiles` URL (and add an API key parameter if the provider needs one).
3. Nothing else changes — `PropertyMap.tsx` and `LocationPicker.tsx` both just consume whatever style `lib/mapStyle.ts` exports.

## 8. Run locally

```bash
npm install
npm run dev
```
Open http://localhost:3000.

## 9. Creating the first administrator account — exact steps

You never give Claude, or anyone, your admin password. Here's how it works:

1. Set `ADMIN_EMAIL=your-real-email@example.com` in `.env.local` (and later in Vercel's env vars too).
2. Go to `/register` on the running site and sign up **using that exact email address**.
3. Behind the scenes: `lib/actions/auth.ts` → `maybePromoteToAdmin()` checks if the email you just registered matches `ADMIN_EMAIL`, and if so, uses the `service_role` key (server-side only, never in the browser) to set `role = 'admin'` on your `profiles` row.
4. Confirm your email (check inbox — Supabase sends a confirmation link by default).
5. Log in. You now have admin access. You chose and typed your own password directly into Supabase Auth's own hashed storage — it was never visible to anyone else and never stored in this codebase.

If you ever need to promote a *different* account later, you can also just run this once in the SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'the-email@example.com';
```

## 10. Deploying to Vercel

1. Push this project to a GitHub repo (see step 16 for git hygiene — `.env.local` is already gitignored).
2. In Vercel: **New Project** → import the repo.
3. Framework preset: Next.js (auto-detected).
4. Under **Environment Variables**, add every variable from `.env.example` with your real values (same as `.env.local`, but set `NEXT_PUBLIC_SITE_URL` to your Vercel URL or custom domain).
5. Deploy.
6. In Supabase → **Authentication → URL Configuration**, add your Vercel URL (and later your custom domain) to **Redirect URLs** so email confirmation and password-reset links work.

## 11. Connecting a custom domain later

1. In Vercel: **Project → Settings → Domains** → add your domain, follow the DNS instructions (usually an A record or CNAME at your registrar).
2. Update `NEXT_PUBLIC_SITE_URL` in Vercel's env vars to the new domain, redeploy.
3. Add the new domain to Supabase's **Redirect URLs** (step 10.6) — otherwise auth emails will link to the old URL.

## 12. What you still need to configure manually

- [ ] Set `ADMIN_EMAIL` and register with that email (step 9)
- [ ] Email deliverability: Supabase's default email sending is rate-limited and fine for development, but for production you should connect a custom SMTP provider in **Project Settings → Auth → SMTP Settings** (e.g. Resend, Postmark) so confirmation/reset emails land reliably
- [ ] WhatsApp/SMS notification provider (Stage 4 — architecture will be stubbed, needs a real provider like Twilio to actually send)
- [ ] Your own logo/imagery — the homepage currently uses gradients instead of stock photos on purpose, so it never ships with placeholder images pretending to be real listings

## 13. Required API keys, all in one place

| Key | Required now? | Where to get it |
|---|---|---|
| Supabase URL + anon key | Yes | Supabase → Project Settings → API |
| Supabase service_role key | Yes | Same page — keep secret |
| Map tile provider (optional upgrade) | Only if you outgrow free OSM tiles | See "Map provider" section above |
| SMTP provider key (Resend/Postmark) | Recommended for prod | Provider's dashboard |
| Twilio/WhatsApp Business key | Future (Stage 4) | Twilio console |

## 14. Where each key goes

All keys are environment variables — never in source code:
- Locally: `.env.local` (gitignored, never committed)
- Production: Vercel → Project Settings → Environment Variables
- `NEXT_PUBLIC_`-prefixed vars are exposed to the browser (safe — the anon key is designed for this). Anything without that prefix stays server-only.

## 15. Updating the site later without losing data

Because **all real data lives in Supabase, not in the Next.js source**, you can freely:
- Redesign components, change copy, restyle pages — none of it touches the database.
- Redeploy to Vercel anytime — Vercel deployments are stateless; your Supabase project is separate infrastructure that persists across every deployment.
- The only thing that *can* affect existing data is a new SQL migration. Always write new migrations as `00X_description.sql` (never edit old ones), and prefer additive changes (`ALTER TABLE ... ADD COLUMN`) over destructive ones (`DROP COLUMN`, `DROP TABLE`).

## 16. Backing up the database before major changes

Simplest: Supabase Dashboard → **Database → Backups** — Pro-tier projects get daily automatic backups; on the Free tier, trigger a manual one before risky changes via:
```bash
supabase db dump -f backup_$(date +%Y%m%d).sql
```
Restore with `psql` against your project's connection string (Project Settings → Database → Connection string) if ever needed.

## 17. Adding future features without breaking existing data

- Always add new columns as **nullable** or with a **default**, so existing rows remain valid.
- Never rename a column in place — add the new column, migrate data with an `UPDATE`, then drop the old one in a *separate* later migration once you've verified the app works.
- Keep RLS policies additive: adding a new policy doesn't remove others, but changing an existing one can — test in a staging Supabase project first if you have one.
- The `seasonal_prices`, `special_offers`, and `availability_blocks` tables already exist in the schema specifically so pricing/availability features can be built later without a schema rewrite.

## 18. Adding English later

The app is Hebrew/RTL by default (`<html lang="he" dir="rtl">` in `app/layout.tsx`). All `name_he`/`name_en` pairs already exist in the schema (cities, categories, amenities) so English content has a home in the database once you're ready — the remaining work is routing (`next-intl` or App Router locale segments) and translating UI strings, not a data model change.

---

### What's built vs. what's next

**Done (Stage 1):** schema, RLS, storage, auth (register/login/logout/reset/admin promotion), homepage with real Supabase-backed sections.

**Done (Stage 2):**
- Full 8-step property submission wizard (`/list-your-property`) — persists everything to Supabase on final submit: property, per-room data, per-room image galleries (separate from the general property gallery), amenities, pricing, contact info. New properties enter `status = 'pending'` and are invisible to the public until approved.
- Image uploads directly to Supabase Storage (`components/wizard/ImageUploader.tsx`), validated for type/size client-side, bucket-level policies enforced server-side.
- Owner dashboard (`/dashboard`) — lists the owner's properties with live status badges and rejection/change-request reasons.
- Admin dashboard (`/admin/properties`) — filterable queue by status, approve / reject (with reason) / request changes (with reason) / suspend / delete / feature, all as real server actions authorized against `profiles.role === 'admin'`.
- Admin user management (`/admin/users`) — promote/demote roles.
- Public property detail page (`/property/[slug]`) — full gallery + lightbox, per-room galleries, amenities, phone + WhatsApp contact, inquiry form (writes to `inquiries` table), favorite button, share button. Only visible once approved (owners/admins can preview earlier statuses).
- Search page (`/search`) with region/city/type/price filters and sorting, plus a destinations index page.
- Favorites page (`/account/favorites`), change-password page.
- 404 page, global loading/error states, legal page framework (privacy/terms/cookies/cancellation/owner-terms), contact page.

**Done (Stage 3):**
- Interactive map with real clustering (`components/properties/PropertyMap.tsx`), running on free MapLibre + OpenStreetMap tiles — no account or credit card needed. Used on the property detail page and as a live results map on `/search`. See "Map provider" section above for how to upgrade to a paid provider later if traffic grows.
- Location picker in the submission wizard (`components/wizard/LocationPicker.tsx`) — owners click the map to set their property's coordinates; respects the "hide exact address" privacy toggle by falling back to `approx_lat`/`approx_lng` on public-facing views.
- Reviews system: 5-category rating form (cleanliness/location/facilities/service/value), review cards with a "verified" badge (verified = the reviewer has an inquiry on record for that property — a real signal until a booking system exists), reporting flow into the `reports` table.
- Property **edit flow** (`/dashboard/properties/[id]/edit`) — was a gap in Stage 2, now real: owners can update details/pricing/amenities, resubmit after rejection/needs-changes, and pause/unpublish an approved listing.
- Notification bell in the header with unread count and mark-as-read, reading real rows from the `notifications` table (which Stage 2's admin actions already write to).
- Recently-viewed tracking — implemented as a small `localStorage` convenience (explicitly *not* part of the persistent data model, same as a browser's history; real user data like favorites and reviews stays in Supabase).
- JSON-LD structured data on property pages for SEO.

**Done (Stage 4 — feature-complete for this build):**
- Similar/recommended properties (same city, falling back to same property type) and a "recently viewed" strip on the property page, both real Supabase queries.
- Admin: manually add a pre-approved property (`/admin/cities` page, top form), full CRUD-style management of cities/categories/amenities (activate/deactivate, add new ones) without touching SQL.
- Admin reports queue (`/admin/reports`) — review and action reports filed against listings or reviews.
- Owner-side availability blocks and seasonal/holiday pricing UI (`components/dashboard/AvailabilityPricingManager.tsx`) on top of the `availability_blocks` / `seasonal_prices` tables from Stage 1's schema.
- Email notification architecture (`lib/email/send.ts`) wired into every moment that already writes an in-app notification — property submitted/approved/rejected/needs-changes, new inquiry. Safely no-ops until you add `RESEND_API_KEY` (see step 13 below); nothing breaks without it.
- Verification badges on property cards.

### What's intentionally not built

A few things the original brief mentioned stay as **prepared architecture, not working features** — building them for real requires a payment processor, a live Airbnb/Booking.com partner API, and SMS/WhatsApp Business API credentials, none of which can be wired up without you choosing and paying for a specific provider:
- Real booking/reservation flow and payments — `availability_blocks`, `min_stay_nights`, `cleaning_fee` etc. exist in the schema exactly so this can be added later without a rewrite, but there's no checkout today.
- Live Airbnb/Booking.com sync — `availability_blocks.source` already has room for `'airbnb' | 'booking'` values; the actual sync job is future work once you have API access to those platforms.
- SMS delivery — WhatsApp/phone contact works today via `wa.me` links and `tel:` links (no API needed); actual SMS notifications would need a Twilio-style integration.
