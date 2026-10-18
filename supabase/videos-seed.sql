-- Videos seed SQL - 7 original demo videos
-- Run AFTER creating the videos table

INSERT INTO videos (file, poster, niche, channel, title, description, published, sort_order)
VALUES
  ('/videos/demo-boutique-whatsapp.mp4', NULL, 'Boutique', 'WhatsApp', 'Boutique WhatsApp Agent', 'Watch how a boutique''s AI agent handles customer enquiries, shares product details, and drives sales on WhatsApp — instantly, 24/7.', TRUE, 1),
  ('/videos/demo-restaurant-whatsapp.mp4', NULL, 'Restaurant', 'WhatsApp', 'Restaurant Booking Agent', 'See an AI agent take table reservations, answer menu questions, and confirm bookings for a restaurant — all on WhatsApp.', TRUE, 2),
  ('/videos/demo-salon-whatsapp.mp4', '/videos/demo-salon-whatsapp.png', 'Salon', 'WhatsApp', 'Salon Appointment Agent', 'Watch how a salon''s AI books appointments, sends reminders, and handles rescheduling on WhatsApp.', TRUE, 3),
  ('/videos/demo-realestate-website.mp4', '/videos/demo-realestate-website.png', 'Real Estate', 'Website', 'Real Estate Lead Agent', 'See an AI agent qualify property buyers, schedule viewings, and capture leads on a real estate website.', TRUE, 4),
  ('/videos/demo-dental-instagram.mp4', '/videos/demo-dental-instagram.png', 'Dental Clinic', 'Instagram', 'Dental Clinic DM Agent', 'Watch how a dental clinic''s AI handles Instagram DMs — booking appointments and answering treatment questions.', TRUE, 5),
  ('/videos/demo-gym-ecommerce.mp4', '/videos/demo-gym-ecommerce.png', 'Gym & Fitness', 'Website', 'Fitness Store Assistant', 'See an AI assistant help gym customers choose plans, answer questions, and reduce drop-offs on a fitness website.', TRUE, 6),
  ('/videos/demo-blog-website.mp4', '/videos/demo-blog-website.png', 'Blog', 'Website', 'Blog Content Assistant', 'Watch how an AI assistant helps blog visitors find articles, answers questions, and captures subscribers.', TRUE, 7)
ON CONFLICT (file) DO UPDATE SET
  poster = EXCLUDED.poster,
  niche = EXCLUDED.niche,
  channel = EXCLUDED.channel,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  published = TRUE,
  sort_order = EXCLUDED.sort_order;
