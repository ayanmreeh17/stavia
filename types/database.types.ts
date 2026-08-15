// Hand-authored baseline matching supabase/migrations/001_initial_schema.sql.
// Once your Supabase project is created and linked, regenerate the fully
// accurate version with:
//   npx supabase login
//   npx supabase link --project-ref YOUR_PROJECT_REF
//   npm run supabase:types
// That will overwrite this file with an exact match of your live schema.

export type UserRole = 'user' | 'owner' | 'admin';
export type PropertyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_changes' | 'suspended';
export type PropertyType =
  | 'villa' | 'cabin' | 'apartment' | 'cottage' | 'farmhouse'
  | 'boutique_hotel' | 'guesthouse' | 'zimmer' | 'unique_stay' | 'other';
export type RegionKey = 'north' | 'center' | 'south' | 'other';
export type InquiryStatus = 'new' | 'read' | 'replied' | 'closed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  phone_country_code: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name_he: string;
  name_en: string | null;
  region: RegionKey | null;
  country_code: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  key: string;
  name_he: string;
  name_en: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Amenity {
  id: string;
  key: string;
  name_he: string;
  name_en: string | null;
  icon: string | null;
  group: string;
  sort_order: number;
  is_active: boolean;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  property_type: PropertyType;
  category_id: string | null;
  country_code: string;
  region: RegionKey | null;
  city_id: string | null;
  address: string | null;
  address_visible: boolean;
  lat: number | null;
  lng: number | null;
  approx_lat: number | null;
  approx_lng: number | null;
  max_guests: number;
  num_rooms: number;
  num_beds: number;
  num_bathrooms: number;
  cover_image_url: string | null;
  phone: string | null;
  phone_country_code: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  status: PropertyStatus;
  rejection_reason: string | null;
  admin_notes: string | null;
  is_featured: boolean;
  view_count: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
}

export interface Room {
  id: string;
  property_id: string;
  name: string;
  room_type: string | null;
  description: string | null;
  num_beds: number;
  bed_types: string[] | null;
  bathroom_info: string | null;
  size_sqm: number | null;
  sort_order: number;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  alt_text: string | null;
  is_cover: boolean;
  sort_order: number;
}

export interface RoomImage {
  id: string;
  room_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
}

export interface Price {
  id: string;
  property_id: string;
  weekday_price: number;
  weekend_price: number;
  currency: string;
  min_stay_nights: number;
  cleaning_fee: number | null;
  additional_guest_fee: number | null;
}

export interface Favorite {
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  cleanliness_rating: number | null;
  location_rating: number | null;
  facilities_rating: number | null;
  service_rating: number | null;
  value_rating: number | null;
  comment: string | null;
  is_verified: boolean;
  is_published: boolean;
  created_at: string;
}

export interface Inquiry {
  id: string;
  property_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  status: InquiryStatus;
  created_at: string;
}

// Minimal Database generic so @supabase/ssr's generics are satisfied.
// This is intentionally loose (not table-by-table Postgres-generated typing)
// until you run `npm run supabase:types` against your real project.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
