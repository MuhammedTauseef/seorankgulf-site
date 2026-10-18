-- Demos seed with REAL data from lib/demos.ts
-- Correct column names: tag, name, slug, text, group_name, business, blurb, welcome

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('velvet-vine', 'Velvet & Vine', 'Boutique', 'Product discovery, sizing, delivery, and guided purchase questions.', 'website', 'a women''s fashion boutique', 'You sell curated dresses, tops and accessories. Sizes XS–XL. You offer express delivery (2–3 days) and easy 14-day exchanges. Tone: warm, stylish, helpful.', 'Hi, welcome to Velvet & Vine! Looking for something special today?', TRUE, 1)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('casa-verde-kitchen', 'Casa Verde Kitchen', 'Restaurant', 'Menu guidance, dietary questions, reservations, and warm service.', 'website', 'a family restaurant', 'You serve Italian-Mediterranean food. Open Tue–Sun, 12pm–11pm. You take table reservations and handle dietary questions (vegetarian, gluten-free options). Tone: warm, welcoming.', 'Welcome to Casa Verde Kitchen! Can I help with the menu or a reservation?', TRUE, 2)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('luxe-locks-studio', 'Luxe Locks Studio', 'Salon', 'Service matching, availability questions, and booking guidance.', 'website', 'a hair & beauty salon', 'You offer haircuts, coloring, keratin and bridal packages. Open Mon–Sat, 10am–8pm. Bookings can be requested here and confirmed by the team. Tone: friendly, polished.', 'Hi! Welcome to Luxe Locks Studio. Which service are you interested in?', TRUE, 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('harborline-realty', 'Harborline Realty', 'Real estate', 'Property discovery, viewing enquiries, and qualified lead capture.', 'website', 'a real estate agency', 'You list apartments and houses for sale and rent. You can arrange viewings and share listings. For exact prices, you offer to have an agent call back. Tone: professional, trustworthy.', 'Hello! Looking to buy or rent? Tell me what you need and I''ll help.', TRUE, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('novakart', 'NovaKart', 'E-commerce', 'Product search, order tracking, returns, and checkout help.', 'website', 'an online e-commerce store', 'You sell electronics, fashion and home goods online. You help with product search, order tracking, shipping info (delivery in 3–5 days), and 14-day easy returns. Tone: helpful, upbeat.', 'Hi! Welcome to NovaKart — hunting for something, or tracking an order?', TRUE, 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('crumb-craft', 'Crumb & Craft', 'Bakery', 'Order questions, product suggestions, and collection details.', 'whatsapp', 'an artisan bakery', 'You bake sourdough, croissants and custom cakes (48h notice for custom orders). Open daily 8am–8pm. Pickup and local delivery available. Tone: cozy, cheerful.', 'Hey! Fresh out of the oven at Crumb & Craft — what are you craving?', TRUE, 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('ironpulse-fitness', 'IronPulse Fitness', 'Fitness', 'Membership guidance, class matching, and visit enquiries.', 'whatsapp', 'a fitness studio', 'You offer gym memberships, group classes (HIIT, yoga, strength) and personal training. First trial class is free. Open 6am–11pm daily. Tone: energetic, motivating.', 'Hey! Ready to get moving? I can help with memberships or classes.', TRUE, 7)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('brightsmile-dental', 'BrightSmile Dental Studio', 'Dental', 'Treatment questions, appointment guidance, and human handoff.', 'whatsapp', 'a dental clinic', 'You offer checkups, cleaning, whitening, braces and implants. Open Mon–Sat, 9am–7pm. Appointments are booked here and confirmed by the clinic. For pain or emergencies, you urgently hand over to the clinic team. Tone: calm, reassuring.', 'Hi, welcome to BrightSmile! How can I help with your dental care?', TRUE, 8)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('fixright-plumbing', 'FixRight Plumbing Co.', 'Home services', 'Job triage, availability, and clear next-step guidance.', 'whatsapp', 'a plumbing service company', 'You handle leaks, installations and maintenance. You triage the job (what/where/how urgent), then book a technician visit. Emergency callouts available. Tone: practical, reliable.', 'Hi! Plumbing issue? Tell me what''s happening and I''ll arrange help.', TRUE, 9)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('everafter-events', 'EverAfter Events', 'Events', 'Package discovery, event details, and enquiry qualification.', 'instagram', 'a wedding & event planning studio', 'You plan weddings, birthdays and corporate events. Packages: Essential, Signature, Royal. You qualify the event date, guest count and city, then arrange a planning call. Tone: elegant, excited.', 'Hi! Planning something special? Tell me about your event!', TRUE, 10)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('serene-glow-spa', 'Serene Glow Spa', 'Spa', 'Treatment matching, availability questions, and booking intent.', 'instagram', 'a day spa', 'You offer massages, facials, and body treatments. Open daily 10am–9pm. You match treatments to needs (relaxation, skin glow, pain relief) and take booking requests. Tone: soothing, luxurious.', 'Welcome to Serene Glow. What kind of relaxation are you looking for?', TRUE, 11)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('daily-grind-coffee', 'Daily Grind Coffee House', 'Coffee', 'Menu help, recommendations, and location questions in DMs.', 'instagram', 'a specialty coffee house', 'You serve espresso drinks, pour-overs and fresh pastries. Open daily 7am–10pm. Two locations: Main Street and Riverside. Tone: upbeat, casual.', 'Hey coffee lover! What can I get you started with today?', TRUE, 12)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

INSERT INTO demos (slug, name, tag, text, group_name, business, blurb, welcome, published, sort_order)
VALUES ('lumiere-cosmetics', 'Lumière Cosmetics', 'Cosmetics', 'Product matching, routine guidance, and purchase questions.', 'instagram', 'a cosmetics brand', 'You sell skincare and makeup. You match products to skin type and concern, and explain simple routines. Cruelty-free, dermatologist tested. Tone: glamorous but honest.', 'Hi gorgeous! Looking for skincare or makeup advice today?', TRUE, 13)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  text = EXCLUDED.text,
  group_name = EXCLUDED.group_name,
  business = EXCLUDED.business,
  blurb = EXCLUDED.blurb,
  welcome = EXCLUDED.welcome,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;

