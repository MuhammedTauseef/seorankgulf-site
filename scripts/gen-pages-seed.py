#!/usr/bin/env python3
"""Generate seed SQL for static pages from current content."""
import json

# Content extracted from the current page.tsx files, converted to Block format
pages = [
    {
        "slug": "about",
        "title": "About — ReplyPilot",
        "content": [
            {"type": "h2", "text": "What we do"},
            {"type": "p", "text": "We build AI sales agents and workflow automations that help small and growing businesses respond faster, capture more leads, and save hours every week. That includes:"},
            {"type": "ul", "items": [
                "WhatsApp DM automation that answers customers instantly",
                "Instagram DM automation for bookings and enquiries",
                "Website chatbots that qualify and capture leads 24/7",
                "E-commerce store assistants that reduce cart abandonment",
                "Custom n8n workflow automations for repetitive tasks"
            ]},
            {"type": "h2", "text": "How we work"},
            {"type": "p", "text": "Every build starts with understanding your business — how you get customers today, where leads slip through, and what eats your time. Then we design, build, and launch a custom AI agent for your business, usually within 48 hours. You see a working demo before you pay anything beyond the upfront split."},
            {"type": "h2", "text": "Why ReplyPilot"},
            {"type": "p", "text": "Most AI tools are generic. We build for one business at a time — your services, your tone, your customers. No templates pretending to be custom. And we stay after launch: the monthly care plan keeps your agent improving as your business grows."},
            {"type": "h2", "text": "Get in touch"},
            {"type": "p", "text": "Want to see what an AI agent could do for your business? Contact us or try a live demo — it takes two minutes."},
        ]
    },
    {
        "slug": "contact",
        "title": "Contact — ReplyPilot",
        "content": [
            {"type": "h2", "text": "Email"},
            {"type": "p", "text": "muhammadtauseef714@gmail.com"},
            {"type": "h2", "text": "What to include"},
            {"type": "p", "text": "Tell us a little about your business and what you'd like to automate — for example:"},
            {"type": "ul", "items": [
                "What kind of business you run",
                "Where you lose leads today (missed DMs? slow replies?)",
                "Which channel matters most (WhatsApp, Instagram, website)"
            ]},
            {"type": "h2", "text": "Prefer to explore first?"},
            {"type": "p", "text": "Try a live demo, read the blog, or watch how the demos work — no signup needed to look around."},
        ]
    },
    {
        "slug": "faq",
        "title": "FAQ — AI Automation Questions Answered | ReplyPilot",
        "content": [
            {"type": "h2", "text": "What is an AI sales agent?"},
            {"type": "p", "text": "An AI sales agent is a smart chatbot that talks to your customers on WhatsApp, Instagram, or your website. It answers questions, books appointments, and captures leads — even at 2 AM when you're asleep. Think of it as a super-helpful employee who never takes a day off."},
            {"type": "h2", "text": "How does WhatsApp automation work?"},
            {"type": "p", "text": "When a customer messages your business on WhatsApp, the AI reads the message and replies instantly — just like a real person would. It can share prices, book appointments, answer common questions, and send the details to you. You only step in when a human touch is needed."},
            {"type": "h2", "text": "Do I need technical skills to use it?"},
            {"type": "p", "text": "No. We build everything for you. You just tell us about your business — your services, prices, and common questions — and we set up the AI agent. Most businesses are live within 48 hours."},
            {"type": "h2", "text": "Will customers know they're talking to AI?"},
            {"type": "p", "text": "The AI talks naturally, like a friendly team member. But we're always honest — if a customer asks, the agent says it's an AI assistant. Most customers care about getting quick, helpful answers, not who's typing them."},
            {"type": "h2", "text": "What happens if the AI can't answer something?"},
            {"type": "p", "text": "The AI is trained on your business, so it handles most questions. For anything tricky, it politely hands the conversation to you with a summary — so you jump in already knowing the full context."},
            {"type": "h2", "text": "Can it work on Instagram too?"},
            {"type": "p", "text": "Yes. The same AI can handle Instagram DMs — replying to enquiries, booking appointments, and answering FAQs. Many businesses use it on WhatsApp, Instagram, and their website all at once."},
            {"type": "h2", "text": "How much does it cost?"},
            {"type": "p", "text": "Pricing is shared after you create a free account and log in. We keep it simple: a one-time build fee and a monthly care plan that keeps your agent improving."},
            {"type": "h2", "text": "How long does setup take?"},
            {"type": "p", "text": "Most builds go live within 48 hours. We study your business, build the agent, test it with you, and then launch. You'll see a working demo before anything goes live."},
            {"type": "h2", "text": "What if I want changes later?"},
            {"type": "p", "text": "That's what the monthly care plan is for. As your business grows — new services, new prices, new questions — we update your agent so it always stays accurate."},
            {"type": "h2", "text": "Is my customer data safe?"},
            {"type": "p", "text": "Yes. Your data is stored securely and never sold or shared. You own your data — your customers, your conversations, your business information."},
        ]
    },
    {
        "slug": "privacy",
        "title": "Privacy Policy — ReplyPilot",
        "content": [
            {"type": "p", "text": "Last updated: October 2026"},
            {"type": "h2", "text": "Who we are"},
            {"type": "p", "text": "ReplyPilot is an AI automation studio run by Muhammad Tauseef. This policy explains what data this website collects and how it is used. If you have questions, email muhammadtauseef714@gmail.com."},
            {"type": "h2", "text": "What we collect"},
            {"type": "ul", "items": [
                "Contact form: your name, email address, and anything you write in the message field.",
                "Chat conversations: messages you send to the on-site AI assistant, so it can reply and — only if you share your details — save your enquiry as a lead.",
                "Account data: if you create an account, your email address and the enquiries tied to it.",
                "Theme preference: whether you chose dark or light mode, stored only in your own browser (localStorage)."
            ]},
            {"type": "h2", "text": "Where your data lives"},
            {"type": "p", "text": "Form submissions, leads, bookings, and account data are stored in a Supabase (PostgreSQL) database with row-level security, so each client can only see their own enquiries. Passwords are handled entirely by Supabase Auth and are never stored in plain text on this site."},
            {"type": "h2", "text": "AI chat"},
            {"type": "p", "text": "The on-site assistant is powered by Google Gemini. Messages you send in chat are processed by Google's API to generate replies, under Google's own terms. We do not use your chat messages for advertising."},
            {"type": "h2", "text": "Cookies"},
            {"type": "p", "text": "This site does not use tracking or advertising cookies. The only thing stored in your browser is your dark/light theme preference (localStorage), which never leaves your device."},
            {"type": "h2", "text": "What we never do"},
            {"type": "ul", "items": [
                "We never sell, rent, or share your personal data.",
                "We never send marketing emails you didn't ask for.",
                "We never publish your enquiries — the demo businesses on this site are fictional samples, not client case studies."
            ]},
            {"type": "h2", "text": "Your rights"},
            {"type": "p", "text": "You can ask at any time to see, correct, or delete the personal data we hold about you — just email muhammadtauseef714@gmail.com and it will be handled personally."},
        ]
    },
    {
        "slug": "terms",
        "title": "Terms of Service — ReplyPilot",
        "content": [
            {"type": "p", "text": "Last updated: October 2026"},
            {"type": "h2", "text": "Using this website"},
            {"type": "p", "text": "By using this site you agree to these terms. ReplyPilot is an AI automation studio operated by Muhammad Tauseef. The content here — including the 13 demo concepts — describes what ReplyPilot can build; the demo businesses are fictional samples, not real clients or results."},
            {"type": "h2", "text": "The AI assistant"},
            {"type": "p", "text": "The on-site chat assistant answers questions about ReplyPilot's services. It can save your contact details as a lead or book a demo slot if you ask it to. It does not give legal, financial, or medical advice, and while it tries to be accurate, you should confirm important details by email at muhammadtauseef714@gmail.com."},
            {"type": "h2", "text": "Services & pricing"},
            {"type": "ul", "items": [
                "Setup: $249 one-time per AI agent, with 50% ($125) due upfront and 50% ($124) on go-live.",
                "Ongoing care: $99/month for hosting, updates, and support, cancellable anytime.",
                "Delivery: first build targeted within 48 hours of the upfront payment; you approve before go-live.",
                "Risk reversal: the second 50% is only due once the agent is live and working as agreed."
            ]},
            {"type": "p", "text": "Exact scope, timelines, and any third-party costs (for example WhatsApp or platform fees, paid directly by the client) are confirmed in writing before work starts."},
            {"type": "h2", "text": "Acceptable use"},
            {"type": "ul", "items": [
                "Don't abuse the contact form, chat, or booking tools.",
                "Don't attempt to break, overload, or bypass this site's security.",
                "Don't use the demos or content here to misrepresent ReplyPilot's work as your own."
            ]},
            {"type": "h2", "text": "Liability"},
            {"type": "p", "text": "This site and its demos are provided \"as is\". To the extent allowed by law, ReplyPilot is not liable for indirect or consequential losses from using the site. Nothing here limits rights you have under applicable consumer law."},
            {"type": "h2", "text": "Changes"},
            {"type": "p", "text": "These terms may be updated occasionally; the date at the top shows the latest version. Continued use of the site after changes means you accept them."},
        ]
    },
    {
        "slug": "disclaimer",
        "title": "Disclaimer | ReplyPilot",
        "content": [
            {"type": "p", "text": "Last updated: October 8, 2026"},
            {"type": "h2", "text": "General information"},
            {"type": "p", "text": "The content on ReplyPilot — including blog articles, guides, demo videos, and AI chat responses — is provided for general information and educational purposes only. While we work hard to keep everything accurate and helpful, we make no guarantees about completeness, reliability, or suitability for your specific situation."},
            {"type": "h2", "text": "No professional advice"},
            {"type": "p", "text": "Nothing on this website constitutes legal, financial, or professional business advice. Always consult a qualified professional before making business decisions based on anything you read here."},
            {"type": "h2", "text": "AI-generated assistance"},
            {"type": "p", "text": "Some content on this site is created with the assistance of AI tools and reviewed by humans before publishing. Demo conversations are illustrative examples, not records of real client interactions."},
            {"type": "h2", "text": "Advertising disclosure"},
            {"type": "p", "text": "This website may display third-party advertisements (including Google AdSense). We do not control the content of these ads, and their appearance here is not an endorsement of the advertised products or services."},
            {"type": "h2", "text": "External links"},
            {"type": "p", "text": "We link to external websites we find useful or trustworthy. We are not responsible for the content, accuracy, or practices of those sites."},
            {"type": "h2", "text": "Results vary"},
            {"type": "p", "text": "Any discussion of automation benefits or business outcomes is illustrative. Individual results depend on many factors, and we do not promise specific results."},
            {"type": "h2", "text": "Contact"},
            {"type": "p", "text": "Questions about this disclaimer: contact us."},
        ]
    },
]

print("-- Seed static pages")
print("-- Run AFTER creating the pages table")
print()
for p in pages:
    content_json = json.dumps(p["content"]).replace("'", "''")
    title_esc = p["title"].replace("'", "''")
    print(f"INSERT INTO pages (slug, title, content, published)")
    print(f"VALUES ('{p['slug']}', '{title_esc}', '{content_json}'::jsonb, TRUE)")
    print(f"ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, published = TRUE;")
    print()
