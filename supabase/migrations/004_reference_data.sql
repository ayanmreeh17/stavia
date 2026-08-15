-- ============================================================================
-- Stavia — Reference data (categories, amenities, regions, Israeli cities)
-- This is NOT fake demo content — it's real lookup data your live site needs
-- (dropdown options, filter facets). Safe to run in production.
-- Separate dev-only sample PROPERTIES live in supabase/seed.sql instead.
-- ============================================================================

insert into public.regions_lookup (key, name_he, name_en) values
  ('north', 'צפון', 'North'),
  ('center', 'מרכז', 'Center'),
  ('south', 'דרום', 'South')
on conflict (key) do nothing;

insert into public.cities (name_he, name_en, region, country_code) values
  ('תל אביב', 'Tel Aviv', 'center', 'IL'),
  ('ירושלים', 'Jerusalem', 'center', 'IL'),
  ('חיפה', 'Haifa', 'north', 'IL'),
  ('אילת', 'Eilat', 'south', 'IL'),
  ('צפת', 'Safed', 'north', 'IL'),
  ('טבריה', 'Tiberias', 'north', 'IL'),
  ('נהריה', 'Nahariya', 'north', 'IL'),
  ('קיסריה', 'Caesarea', 'center', 'IL'),
  ('הרצליה', 'Herzliya', 'center', 'IL'),
  ('מצפה רמון', 'Mitzpe Ramon', 'south', 'IL'),
  ('עין גדי', 'Ein Gedi', 'south', 'IL'),
  ('רמת הגולן', 'Golan Heights', 'north', 'IL'),
  ('גליל עליון', 'Upper Galilee', 'north', 'IL'),
  ('גליל תחתון', 'Lower Galilee', 'north', 'IL'),
  ('עמק הירדן', 'Jordan Valley', 'north', 'IL'),
  ('באר שבע', 'Beer Sheva', 'south', 'IL')
on conflict do nothing;

insert into public.categories (key, name_he, name_en, icon, sort_order) values
  ('villa', 'וילות', 'Villas', 'home', 1),
  ('cabin', 'צימרים', 'Cabins', 'tree-pine', 2),
  ('pool', 'עם בריכה', 'With Pool', 'waves', 3),
  ('nature', 'בטבע', 'In Nature', 'mountain', 4),
  ('luxury', 'יוקרה', 'Luxury', 'gem', 5),
  ('family', 'למשפחות', 'Family Friendly', 'users', 6),
  ('romantic', 'זוגי', 'Romantic Getaway', 'heart', 7),
  ('pet_friendly', 'ידידותי לחיות מחמד', 'Pet Friendly', 'paw-print', 8)
on conflict (key) do nothing;

insert into public.amenities (key, name_he, name_en, "group", sort_order) values
  ('pool', 'בריכת שחייה', 'Swimming Pool', 'pool', 1),
  ('private_pool', 'בריכה פרטית', 'Private Pool', 'pool', 2),
  ('heated_pool', 'בריכה מחוממת', 'Heated Pool', 'pool', 3),
  ('indoor_pool', 'בריכה מקורה', 'Indoor Pool', 'pool', 4),
  ('jacuzzi', 'ג׳קוזי', 'Jacuzzi', 'pool', 5),
  ('bbq', 'מנגל / BBQ', 'BBQ', 'outdoor', 6),
  ('wifi', 'Wi-Fi', 'Wi-Fi', 'general', 7),
  ('ac', 'מיזוג אוויר', 'Air Conditioning', 'general', 8),
  ('parking', 'חניה', 'Parking', 'general', 9),
  ('kitchen', 'מטבח מאובזר', 'Kitchen', 'kitchen', 10),
  ('smart_tv', 'טלוויזיה חכמה', 'Smart TV', 'general', 11),
  ('washing_machine', 'מכונת כביסה', 'Washing Machine', 'general', 12),
  ('dryer', 'מייבש כביסה', 'Dryer', 'general', 13),
  ('balcony', 'מרפסת', 'Balcony', 'outdoor', 14),
  ('garden', 'גינה', 'Garden', 'outdoor', 15),
  ('outdoor_seating', 'ישיבה חיצונית', 'Outdoor Seating', 'outdoor', 16),
  ('sunbeds', 'מיטות שיזוף', 'Sunbeds', 'outdoor', 17),
  ('fireplace', 'קמין', 'Fireplace', 'general', 18),
  ('sauna', 'סאונה', 'Sauna', 'general', 19),
  ('outdoor_shower', 'מקלחת חיצונית', 'Outdoor Shower', 'outdoor', 20),
  ('dining_area', 'פינת אוכל', 'Dining Area', 'kitchen', 21),
  ('coffee_machine', 'מכונת קפה', 'Coffee Machine', 'kitchen', 22),
  ('refrigerator', 'מקרר', 'Refrigerator', 'kitchen', 23),
  ('microwave', 'מיקרוגל', 'Microwave', 'kitchen', 24),
  ('oven', 'תנור אפייה', 'Oven', 'kitchen', 25),
  ('dishwasher', 'מדיח כלים', 'Dishwasher', 'kitchen', 26),
  ('accessible', 'נגישות לנכים', 'Accessible', 'general', 27),
  ('pet_friendly', 'ידידותי לחיות מחמד', 'Pet Friendly', 'general', 28),
  ('family_friendly', 'ידידותי למשפחות', 'Family Friendly', 'general', 29),
  ('view', 'נוף', 'Scenic View', 'outdoor', 30)
on conflict (key) do nothing;
