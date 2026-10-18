import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Privacy Policy — SEORankGulf",
  description:
    "How SEORankGulf collects, uses, and protects your data. Contact-form data is stored in Supabase; we never sell your data.",
  alternates: {
    canonical: "https://seorankgulf.com/privacy",
  },
  openGraph: {
    url: "https://seorankgulf.com/privacy",
    images: [
      {
        url: "https://seorankgulf.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SEORankGulf — AI Sales Agents for Small Business",
      },
    ],
  }
};

const fallbackBlocks: Block[] = [
  { type: "p", text: "Last updated: October 14, 2026" },
  { type: "h2", text: "Who we are" },
  { type: "p", text: "SEORankGulf is an AI automation studio run by Muhammad Tauseef. This policy explains what data this website collects, why, and how it is handled. If you have questions, email muhammadtauseef714@gmail.com." },
  { type: "h2", text: "Data we collect" },
  { type: "ul", items: [
      "Contact form: your name, email address, business type, and anything you write in the message field.",
      "On-site AI chat: the messages you send to the chat assistant. If you share your name and email address or phone number and show interest in a demo or callback, the assistant can save those details as a lead. If you ask to book a demo, it saves your name, email address, phone number, and chosen time slot as a booking.",
      "Chat transcripts: the recent messages from a chat session (the last 13 messages) are stored so enquiries can be reviewed.",
      "Account data: if you create an account, your email address and the enquiries tied to it. If you sign in with Google, Google shares your name, email address, and profile picture to create your account.",
      "Usage data: pages visited, measured with Google Analytics only after you accept cookies (see Cookies below).",
      "Preferences stored in your own browser: your dark or light theme choice, and your cookie consent choice. These stay on your device."
    ] },
  { type: "h2", text: "How we use your data" },
  { type: "ul", items: [
      "To reply to your enquiry or demo request.",
      "To create and manage your account and provide the services you asked for.",
      "To improve the website, using aggregated analytics.",
      "We never sell, rent, or share your personal data with anyone for their own marketing.",
      "We never send marketing emails you did not ask for."
    ] },
  { type: "h2", text: "Where your data lives" },
  { type: "p", text: "Form submissions, leads, bookings, chat transcripts, and account data are stored in a Supabase (PostgreSQL) database with row-level security, so only authorised access can read them. Passwords are handled entirely by Supabase Auth and are never stored in plain text on this site. The website is hosted on Vercel." },
  { type: "h2", text: "Third-party services" },
  { type: "ul", items: [
      "Supabase: database, authentication, and data storage for the services above.",
      "Google Gemini: the on-site chat assistant is powered by Google Gemini. Messages you send in chat are processed by Google's API to generate replies, under Google's own terms. We do not use your chat messages for advertising.",
      "Google Analytics: measures site usage only after you accept cookies (see Cookies below).",
      "Vercel: hosts this website."
    ] },
  { type: "h2", text: "Cookies" },
  { type: "ul", items: [
      "Theme preference: your dark or light theme choice, stored only in your browser (localStorage). It never leaves your device.",
      "Cookie consent choice: your Accept or Reject choice, stored only in your browser (localStorage).",
      "Authentication: if you sign in, Supabase Auth sets session cookies to keep you signed in.",
      "Google Analytics (GA4, measurement ID G-1QP894DHB3): only runs if you click Accept in the cookie banner. Before that, Google Consent Mode keeps analytics storage, advertising storage, advertising user data, and advertising personalisation denied. If you click Reject, they stay denied.",
      "You can change your choice at any time by clearing this site's data in your browser settings; the banner will appear again."
    ] },
  { type: "h2", text: "Advertising" },
  { type: "p", text: "This site does not currently show advertisements. In the future, advertising may be shown through Google AdSense. If that happens, Google may use cookies to serve and measure ads, including advertising storage and personalisation, subject to the consent choice you make in the cookie banner. This section will be updated if advertising goes live." },
  { type: "h2", text: "Data retention" },
  { type: "p", text: "We keep your data only as long as it is needed for the purpose it was collected for: to respond to your enquiry, to manage your account, or to operate this website. There is no fixed retention period in the site's code; when data is no longer needed, it is deleted. You can ask for earlier deletion at any time (see Your rights)." },
  { type: "h2", text: "Your rights" },
  { type: "p", text: "You can ask at any time to see, correct, or delete the personal data we hold about you. Just email muhammadtauseef714@gmail.com and it will be handled personally. There is no data protection officer and no automated decision-making on this site." },
  { type: "h2", text: "Changes" },
  { type: "p", text: "This policy may be updated occasionally; the date at the top shows the latest version. Continued use of the site after changes means you accept the updated policy." },
];

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return <h2 key={i}>{block.text}</h2>;
    case "ul":
      return (
        <ul key={i}>
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "img":
      return null; // images not used on static pages
    default:
      return <p key={i}>{(block as { text: string }).text}</p>;
  }
}

/** /privacy — plain-language privacy policy. Content editable via admin. */
export default async function PrivacyPage() {
  const page = await getStaticPage("privacy");
  const blocks = page?.content?.length ? page.content : fallbackBlocks;

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Privacy Policy</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Your data, handled with care.
          </h1>

          <div className="legal-body">
            {blocks.map(renderBlock)}
            <p>
              <Link href="/">← Back to home</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
