/**
 * SEO metadata for demo videos that exist as local files in public/videos/
 * but have no published Supabase row yet (the agent's Supabase service
 * credential is 401, so gallery rows are inserted later by hand or via the
 * admin CMS). getPublishedVideos() merges these in, deduped by file path,
 * so new videos show in the gallery with full SEO from the moment the
 * files deploy. Once a matching DB row exists, the DB row wins.
 */
export interface LocalVideoSeo {
  niche: string;
  channel: string;
  title: string;
  description: string;
  posterAlt: string;
}

/** Keyed by the exact public file path, e.g. "/videos/demo-pharmacy-whatsapp.mp4". */
export const videoSeoMeta: Record<string, LocalVideoSeo> = {
  "/videos/demo-house-painters-whatsapp.mp4": {
    niche: "House Painters",
    channel: "WhatsApp",
    title: "House Painters WhatsApp AI Demo — Quotes in Minutes, Jobs Booked While You Paint",
    description:
      "Meet Hue, a demo WhatsApp AI agent for house painting businesses, asking room counts, collecting job photos, giving honest price ranges from real rates, and booking site visits in minutes — while the painter keeps painting. This 30-second demo shows WhatsApp automation winning painting jobs around the clock: instant replies to quote requests, photo-based estimates, calendar booking, and automatic follow-ups. Want one for your painting business? Get a free custom demo built around your prices, your services, and your booking flow.",
    posterAlt: "House painters WhatsApp AI agent demo — quotes in minutes, jobs booked while you paint",
  },
  "/videos/demo-pet-grooming-instagram.mp4": {
    niche: "Pet Grooming Salon",
    channel: "Instagram",
    title: "Pet Grooming AI Instagram Demo — Never Miss Another Grooming Booking",
    description:
      "Meet Ivy, a demo AI Instagram DM agent for pet grooming salons, answering breed and size questions instantly, confirming slot availability around the clock, and booking grooming appointments while the salon sleeps. This 30-second demo shows Instagram DM automation running a pet salon's customer service 24/7 — instant answers to late-night DMs, zero missed grooming bookings, and staff free to groom instead of answering the inbox. Want one for your salon? Get a free custom demo built around your services, your pricing, and your booking flow.",
    posterAlt: "Pet grooming salon AI Instagram DM agent demo — never miss another grooming booking",
  },
  "/videos/demo-bridal-ecommerce.mp4": {
    niche: "Bridal Shop",
    channel: "E-commerce",
    title: "Bridal Shop AI E-commerce Demo — Sell Bridal Gowns While You Sleep",
    description:
      "Meet Theo, a demo AI e-commerce store assistant for bridal shops, guiding brides to the right gown style, answering sizing, fabric, and delivery questions instantly, and recovering abandoned carts automatically. This 30-second demo shows an AI sales agent running an online bridal store's sales chat 24/7 — 24/7 customer support, smart product discovery, and zero lost sales while the team rests. Want one for your shop? Get a free custom demo built around your gowns, your sizing guide, and your checkout flow.",
    posterAlt: "Bridal shop AI e-commerce store assistant demo — sell bridal gowns while you sleep",
  },
  "/videos/demo-plumbing-instagram.mp4": {
    niche: "Plumbing Services",
    channel: "Instagram",
    title: "Plumbing Services AI Instagram Demo — Never Miss Another Plumbing Job",
    description:
      "Meet Wren, a demo AI Instagram DM agent built for plumbers, confirming service areas in seconds, triaging emergency call-outs against routine jobs around the clock, and booking repair slots while the business sleeps. This 30-second demo shows Instagram DM automation running a plumbing company's customer service 24/7 — instant answers to emergency DMs, zero missed jobs, and the team free to focus on the wrench instead of the inbox. Want one for your plumbing business? Get a free custom demo built around your services, your FAQs, and your booking flow.",
    posterAlt: "Plumbing services AI Instagram DM agent demo — never miss another plumbing job",
  },
  "/videos/demo-furniture-ecommerce.mp4": {
    niche: "Furniture Store",
    channel: "E-commerce",
    title: "Furniture Store AI E-commerce Demo — Sell Furniture While You Sleep",
    description:
      "Meet Rowan, a demo AI e-commerce store assistant built for furniture stores, guiding shoppers to the right sofa, answering fabric, size, and delivery questions instantly, and recovering abandoned carts automatically. This 30-second demo shows an AI sales agent working an online furniture store around the clock — 24/7 customer support, smart product discovery, and zero lost sales while the team rests. Want one for your store? Get a free custom demo built around your catalog, your FAQs, and your checkout flow.",
    posterAlt: "Furniture store AI e-commerce assistant demo — sell furniture while you sleep",
  },
  "/videos/demo-pharmacy-whatsapp.mp4": {
    niche: "Pharmacy",
    channel: "WhatsApp",
    title: "Pharmacy AI WhatsApp Demo — Never Miss Another Prescription",
    description:
      "Watch Rhea, a demo AI WhatsApp agent for pharmacies, confirm prescription refills in seconds, answer opening-hours and medicine-stock questions instantly, and arrange home delivery around the clock. This 30-second demo shows WhatsApp automation running a pharmacy's customer service 24/7 — instant answers, zero missed refill requests, and staff free to focus on care instead of the inbox. Want one for your pharmacy? Get a free custom demo built around your medicines, opening hours, and delivery flow.",
    posterAlt: "Pharmacy AI WhatsApp agent demo — never miss another prescription",
  },
  "/videos/demo-lawfirm-website.mp4": {
    niche: "Law Firm",
    channel: "Website",
    title: "Law Firm AI Website Demo — Capture Every Case Lead",
    description:
      "Meet Sage, a demo AI website chatbot for law firms, greeting visitors after hours, answering practice-area questions, and capturing case details as qualified leads straight into the intake flow. This 30-second demo shows website chatbot automation turning midnight visitors into booked consultations — no enquiry ever waits for office hours. Want one for your firm? Get a free custom demo built around your practice areas and client intake process.",
    posterAlt: "Law firm AI website chatbot demo — capture every case lead",
  },
  "/videos/demo-bakery-website.mp4": {
    niche: "Bakery",
    channel: "Website",
    title: "Bakery AI Website Demo — Take Orders While You Sleep",
    description:
      "Meet Honey, a demo AI website assistant for bakeries, taking custom cake orders around the clock, answering freshness, ingredient, and delivery questions instantly, and suggesting add-ons at checkout automatically. This 30-second demo shows website automation running a bakery's online orders 24/7 — instant answers, zero missed custom orders, and staff free to bake instead of answering the inbox. Want one for your bakery? Get a free custom demo built around your menu, your order flow, and your delivery zones.",
    posterAlt: "Bakery AI website assistant demo — take orders while you sleep",
  },
  "/videos/demo-car-dealership-instagram.mp4": {
    niche: "Car Dealership",
    channel: "Instagram",
    title: "Car Dealership AI Instagram Demo — Never Miss Another Test Drive",
    description:
      "Meet Axel, a demo AI Instagram DM agent for car dealerships, answering price, trim, and availability questions in seconds, booking test drives around the clock, and following up on every enquiry automatically. This 30-second demo shows Instagram DM automation running a dealership's lead flow 24/7 — instant answers to hot DMs, zero missed test drives, and salespeople free to close instead of chasing the inbox. Want one for your dealership? Get a free custom demo built around your inventory, your offers, and your booking flow.",
    posterAlt: "Car dealership AI Instagram DM agent demo — never miss another test drive",
  },
  "/videos/demo-ecommerce-whatsapp.mp4": {
    niche: "E-commerce Store",
    channel: "WhatsApp",
    title: "E-commerce AI WhatsApp Demo — Turn Chats Into Checkouts",
    description:
      "Meet Pippa, a demo AI WhatsApp agent for online stores, answering product and delivery questions instantly, recovering abandoned carts automatically, and sending order updates around the clock. This 30-second demo shows WhatsApp automation running an e-commerce store's customer chat 24/7 — instant answers, zero lost carts, and the team free to grow instead of answering the inbox. Want one for your store? Get a free custom demo built around your catalog, your FAQs, and your checkout flow.",
    posterAlt: "E-commerce store AI WhatsApp agent demo — turn chats into checkouts",
  },
  "/videos/demo-fitness-store.mp4": {
    niche: "Fitness Store",
    channel: "E-commerce",
    title: "Fitness Store AI Demo — Turn Browsers Into Buyers",
    description:
      "Meet Flex, a demo AI store assistant for fitness brands, guiding shoppers to the right gear, answering sizing, material, and delivery questions instantly, and recovering abandoned carts automatically. This 30-second demo shows AI automation running a fitness store's sales chat 24/7 — instant answers, zero lost sales, and the team free to focus on the brand instead of the inbox. Want one for your store? Get a free custom demo built around your catalog, your FAQs, and your checkout flow.",
    posterAlt: "Fitness store AI assistant demo — turn browsers into buyers",
  },
  "/videos/demo-hotel-website.mp4": {
    niche: "Hotel",
    channel: "Website",
    title: "Hotel AI Website Demo — Fill Rooms While You Sleep",
    description:
      "Meet Aria, a demo AI website chatbot for hotels, answering room, rate, and amenity questions instantly, taking direct bookings around the clock, and recommending spa and dining automatically. This 30-second demo shows website chatbot automation filling hotel rooms 24/7 — instant answers for midnight planners, zero lost direct bookings, and staff free to host instead of answering the inbox. Want one for your hotel? Get a free custom demo built around your rooms, your rates, and your booking flow.",
    posterAlt: "Hotel AI website chatbot demo — fill rooms while you sleep",
  },
  "/videos/demo-veterinary-instagram.mp4": {
    niche: "Veterinary Clinic",
    channel: "Instagram",
    title: "Veterinary Clinic AI Instagram Demo — Never Miss Another Pet Appointment",
    description:
      "Meet Jade, a demo AI Instagram DM agent for veterinary clinics, checking pet symptoms in seconds, finding an open slot instantly, and booking the check-up while the clinic sleeps. This 30-second demo shows Instagram DM automation running a vet clinic's bookings 24/7 — instant answers to worried pet owners, zero missed appointments, and staff free to care for animals instead of answering the inbox. Want one for your clinic? Get a free custom demo built around your services, your hours, and your booking flow.",
    posterAlt: "Veterinary clinic AI Instagram DM agent demo — never miss another pet appointment",
  },
  "/videos/demo-cleaning-ecommerce.mp4": {
    niche: "Cleaning Services",
    channel: "E-commerce",
    title: "Cleaning Services AI E-commerce Demo — Book Cleanings While You Sleep",
    description:
      "Meet Owen, a demo AI store assistant for cleaning services, explaining cleaning packages in plain words, answering timing and what's-included questions instantly, and booking the cleaning automatically around the clock. This 30-second demo shows AI automation running a cleaning company's bookings 24/7 — instant answers to evening enquiries, zero missed jobs, and the team free to clean instead of answering messages. Want one for your business? Get a free custom demo built around your packages, your pricing, and your booking flow.",
    posterAlt: "Cleaning services AI store assistant demo — book cleanings while you sleep",
  },
};
