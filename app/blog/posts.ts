/** Blog post data for /blog. Education-first, SEO-optimized articles. */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "img"; src: string; alt: string; caption?: string }
  | { type: "video"; src: string; poster?: string; caption?: string }
  | { type: "quick-answer"; text: string };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  keywords: string[];
  content: Block[];
}

export const posts: Post[] = [
  {
    slug: "local-seo-dubai-small-business-guide",
    title: "Local SEO for Dubai Small Businesses: The Complete 2026 Guide",
    excerpt:
      "How Dubai small businesses can rank on Google Maps and local search. Google Business Profile, citations, reviews, and local keywords — explained simply.",
    date: "October 18, 2026",
    readTime: "8 min read",
    keywords: [
      "local SEO Dubai",
      "Google Business Profile Dubai",
      "local SEO small business UAE",
    ],
    content: [
      {
        type: "quick-answer",
        text: "Local SEO helps Dubai businesses appear on Google Maps and in 'near me' searches. The essentials: claim and optimize your Google Business Profile, keep your business name/address/phone identical everywhere online, gather genuine customer reviews, and create location-specific pages on your website.",
      },
      {
        type: "p",
        text: "When someone in Dubai searches 'restaurant near me' or 'plumber in JLT', Google shows a map with three businesses. Getting into those three spots is the single highest-ROI marketing move a local business can make — and it's free.",
      },
      {
        type: "h2",
        text: "Step 1: Claim Your Google Business Profile",
      },
      {
        type: "p",
        text: "Go to google.com/business and claim your listing. Fill in everything: correct business name, full address, phone number, opening hours, services, and at least 10 real photos of your business. Businesses with complete profiles get significantly more calls than incomplete ones.",
      },
      {
        type: "h2",
        text: "Step 2: Keep Your NAP Identical Everywhere",
      },
      {
        type: "p",
        text: "NAP stands for Name, Address, Phone. It must be character-for-character identical on your website, Google Business Profile, Facebook, Instagram, and every directory (Dubizzle, Yellow Pages UAE, etc.). Even a small difference — 'Street' vs 'St.' — confuses Google and hurts rankings.",
      },
      {
        type: "h2",
        text: "Step 3: Get Reviews — Then Reply to Every One",
      },
      {
        type: "p",
        text: "Ask every happy customer for a Google review. A simple 'We'd love your feedback on Google' at checkout works. Then reply to every review, positive or negative, within 48 hours. Review count and response rate are both ranking signals.",
      },
      {
        type: "ul",
        items: [
          "Ask in person right after a good experience — timing matters",
          "Send a WhatsApp follow-up with the direct review link",
          "Never buy fake reviews — Google detects and penalizes them",
          "Reply to negative reviews calmly and offer to fix the issue",
        ],
      },
      {
        type: "h2",
        text: "Step 4: Create Location Pages",
      },
      {
        type: "p",
        text: "If you serve multiple areas, create a dedicated page for each: '/cleaning-service-jlt-dubai', '/cleaning-service-marina-dubai'. Each page should mention the area naturally, include local landmarks, and have unique content — never copy-paste the same text with only the area name changed.",
      },
      {
        type: "h2",
        text: "Step 5: Get Listed in UAE Directories",
      },
      {
        type: "p",
        text: "Submit your business to Dubizzle, Yellow Pages UAE, and industry-specific directories. Each quality listing is a citation that reinforces your location to Google. Prioritize directories that real customers actually use.",
      },
      {
        type: "h2",
        text: "How Long Does Local SEO Take?",
      },
      {
        type: "p",
        text: "Most Dubai businesses see Google Business Profile improvements within 4-8 weeks: more profile views, more calls, more direction requests. Full map-pack rankings for competitive keywords typically take 3-6 months of consistent work.",
      },
      {
        type: "h2",
        text: "FAQs",
      },
      {
        type: "h3",
        text: "Is Google Business Profile free?",
      },
      {
        type: "p",
        text: "Yes, completely free. Google makes money from ads, not listings. Anyone charging you just to 'claim' your profile is selling you something you can do yourself in 20 minutes.",
      },
      {
        type: "h3",
        text: "Do I need a physical shop for local SEO?",
      },
      {
        type: "p",
        text: "Not necessarily. Service-area businesses (plumbers, cleaners, delivery services) can list without showing a public address. You define the areas you serve instead.",
      },
      {
        type: "h3",
        text: "Should my website be in Arabic too?",
      },
      {
        type: "p",
        text: "English covers most commercial searches in Dubai, but an Arabic version captures additional traffic with less competition. At minimum, ensure your Google Business Profile has accurate info — many customers search in Arabic on Maps.",
      },
      {
        type: "h3",
        text: "How many reviews do I need?",
      },
      {
        type: "p",
        text: "There's no magic number, but aim to have more recent reviews than your direct competitors. Twenty genuine recent reviews beat two hundred old ones.",
      },
      {
        type: "h3",
        text: "Can I do local SEO myself?",
      },
      {
        type: "p",
        text: "The basics — yes. Claim your profile, fix your NAP, ask for reviews. But competitive keywords, technical issues, and ongoing content need consistent expert work. That's what we do at SEORankGulf.",
      },
    ],
  },
  {
    slug: "how-much-does-seo-cost-dubai-2026",
    title: "How Much Does SEO Cost in Dubai? Honest 2026 Price Guide",
    excerpt:
      "Real SEO pricing in Dubai and the UAE: what freelancers, agencies, and in-house SEO cost, what each price tier actually buys, and red flags to avoid.",
    date: "October 18, 2026",
    readTime: "7 min read",
    keywords: [
      "SEO cost Dubai",
      "SEO pricing UAE",
      "how much does SEO cost",
    ],
    content: [
      {
        type: "quick-answer",
        text: "In Dubai, SEO costs range from AED 1,000/month for basic freelancer work to AED 15,000+/month for enterprise agencies. Most small businesses pay AED 1,500–5,000/month for legitimate ongoing SEO. One-time audits run AED 2,000–8,000. Anyone promising page-one rankings for AED 500/month is selling you something worthless or dangerous.",
      },
      {
        type: "p",
        text: "Ask ten Dubai agencies what SEO costs and you'll get ten different answers. This guide gives you the real numbers — what each price tier buys, what's reasonable, and the red flags that signal a scam.",
      },
      {
        type: "h2",
        text: "SEO Pricing Tiers in the UAE",
      },
      {
        type: "ul",
        items: [
          "Freelancer (AED 1,000–2,500/mo): basic on-page work, limited reporting. Fine for very small sites with low competition.",
          "Boutique agency (AED 2,500–6,000/mo): proper audits, content, link building, monthly reports. The sweet spot for most SMEs.",
          "Mid-size agency (AED 6,000–15,000/mo): dedicated team, multi-channel strategy, enterprise reporting. For competitive niches.",
          "Enterprise (AED 15,000+/mo): full teams, custom strategy, often bundled with PPC and content marketing.",
        ],
      },
      {
        type: "h2",
        text: "What Affects the Price?",
      },
      {
        type: "p",
        text: "Four things drive cost: competition in your niche (real estate SEO costs more than niche B2B), your website's current state (a broken site needs more fix work), how many locations you target (one shop vs. five branches), and whether you need content in both English and Arabic.",
      },
      {
        type: "h2",
        text: "One-Time vs. Monthly",
      },
      {
        type: "p",
        text: "A one-time SEO audit (AED 2,000–8,000) tells you what's wrong. Monthly SEO fixes it and keeps it fixed. Google rewards consistent effort — a single audit without follow-through rarely moves rankings. Think of it like fitness: one gym assessment doesn't build muscle.",
      },
      {
        type: "h2",
        text: "Red Flags: When Cheap SEO Is Expensive",
      },
      {
        type: "ul",
        items: [
          "Guaranteed #1 rankings — impossible to guarantee, a classic scam signal",
          "'1,000 backlinks for AED 500' — toxic links that get you penalized",
          "No reporting — if they won't show you what they did, they did nothing",
          "Long lock-in contracts — legitimate agencies earn renewal monthly",
          "No questions about your business — real SEO starts with understanding your customers",
        ],
      },
      {
        type: "h2",
        text: "What Should You Budget?",
      },
      {
        type: "p",
        text: "A Dubai restaurant or salon targeting one area: AED 1,500–3,000/month is realistic. A real estate agency or clinic in a competitive niche: AED 4,000–8,000/month. Start with a proper audit, fix the foundations, then scale spend as revenue from organic traffic grows.",
      },
      {
        type: "h2",
        text: "FAQs",
      },
      {
        type: "h3",
        text: "Is cheap SEO ever worth it?",
      },
      {
        type: "p",
        text: "Rarely. AED 500/month SEO typically means automated reports and zero real work — or worse, spammy tactics that get your site penalized. The cheapest SEO is the SEO you have to pay twice to undo.",
      },
      {
        type: "h3",
        text: "Should I hire in-house or an agency?",
      },
      {
        type: "p",
        text: "One in-house SEO specialist in Dubai costs AED 8,000–15,000/month in salary alone. An agency gives you a team (strategist, writer, technical) for less. In-house makes sense once SEO drives enough revenue to justify a full-time role.",
      },
      {
        type: "h3",
        text: "How do I know if my SEO is working?",
      },
      {
        type: "p",
        text: "Track three things monthly: keyword rankings for your target terms, organic traffic in Google Analytics, and — most importantly — enquiries/calls attributed to organic search. Rankings without revenue are vanity.",
      },
      {
        type: "h3",
        text: "Can I pay for performance only?",
      },
      {
        type: "p",
        text: "Some agencies offer hybrid models (base retainer + bonus for results). Pure pay-per-ranking deals attract corner-cutting. A small base plus performance bonus aligns incentives best.",
      },
    ],
  },
  {
    slug: "keyword-research-small-business-uae",
    title: "Keyword Research for UAE Small Businesses: A Practical Guide",
    excerpt:
      "How to find the keywords your customers actually search. Free methods using Google itself — no expensive tools needed to start.",
    date: "October 18, 2026",
    readTime: "6 min read",
    keywords: [
      "keyword research UAE",
      "how to do keyword research",
      "SEO keywords Dubai",
    ],
    content: [
      {
        type: "quick-answer",
        text: "Start keyword research with Google itself: type your service into search and note the autocomplete suggestions, check the 'People Also Ask' box, and scroll to 'Related searches.' These are real searches from real customers — and they're free. Target specific long-tail phrases like 'emergency plumber JLT' over broad terms like 'plumber.'",
      },
      {
        type: "p",
        text: "You don't need a AED 500/month tool to start keyword research. Google tells you what people search — you just have to know where to look.",
      },
      {
        type: "h2",
        text: "Method 1: Google Autocomplete",
      },
      {
        type: "p",
        text: "Type your service into Google (use incognito mode) and watch the suggestions appear. Each suggestion is a real, popular search. Type 'cleaning service d' and you'll see 'cleaning service dubai', 'cleaning service dubai price', 'deep cleaning service dubai' — each one is a potential page or article.",
      },
      {
        type: "h2",
        text: "Method 2: People Also Ask",
      },
      {
        type: "p",
        text: "Search your main keyword and find the 'People Also Ask' box. Every question there is content your customers want. Each question can become an FAQ on your page — or a full article. Click questions to reveal more; Google keeps generating them.",
      },
      {
        type: "h2",
        text: "Method 3: Related Searches",
      },
      {
        type: "p",
        text: "Scroll to the bottom of any Google results page. The eight 'related searches' are gold — they're the searches Google considers closest to yours. Collect them all into a spreadsheet.",
      },
      {
        type: "h2",
        text: "Think Local: Add Your Area",
      },
      {
        type: "p",
        text: "For UAE businesses, the magic formula is service + area: 'dentist JBR', 'car wash Al Barsha', 'maid service Mirdif'. These long-tail local keywords have far less competition than city-wide terms, and the searcher is ready to buy — they told you exactly where they are.",
      },
      {
        type: "ul",
        items: [
          "Service + city: 'SEO services Dubai' — moderate competition",
          "Service + area: 'plumber JLT Dubai' — low competition, high intent",
          "Service + price: 'deep cleaning Dubai price' — buyer comparing options",
          "Question format: 'how much does X cost in Dubai' — research-stage buyer",
        ],
      },
      {
        type: "h2",
        text: "How to Choose Which Keywords to Target",
      },
      {
        type: "p",
        text: "Score each keyword: Is the searcher likely to become a customer? (commercial intent) + Can you realistically rank for it? (check who's on page one — if they're all huge companies, pick a more specific variation). Start with 10-15 keywords where both answers are yes.",
      },
      {
        type: "h2",
        text: "FAQs",
      },
      {
        type: "h3",
        text: "How many keywords should I target?",
      },
      {
        type: "p",
        text: "Start with 10-15 closely related keywords. One strong page can rank for dozens of variations. Spreading thin across 100 keywords means ranking for none.",
      },
      {
        type: "h3",
        text: "Do I need paid keyword tools?",
      },
      {
        type: "p",
        text: "Not to start. Google's free suggestions are real search data. Paid tools add search volume numbers, which help prioritize — consider them once you're investing seriously in content.",
      },
      {
        type: "h3",
        text: "Should I target English or Arabic keywords?",
      },
      {
        type: "p",
        text: "English first for most Dubai commercial searches — that's where the volume is. Arabic keywords have less competition and can be a smart second phase, especially for consumer services.",
      },
    ],
  },
];
