import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

const TITLE = "Privacy Policy";
const DESCRIPTION = "BLAKASH Game Studio Privacy Policy — how we collect, use, and protect your information across blakash.com and the Doodle Tow mobile app.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.blakash.com/privacy" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://www.blakash.com/privacy",
    siteName: "BLAKASH",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/Image/hak-hero-v1.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/Image/hak-hero-v1.png"],
  },
};

const sectionClass = "max-w-3xl mx-auto px-6";
const h2Class = "text-xl sm:text-2xl font-bold font-space mt-12 mb-4 text-bone";
const h3Class = "text-base font-bold text-ash-300 mt-6 mb-2";
const pClass = "text-zinc-400 leading-7 mb-4";
const liClass = "text-zinc-400 leading-7";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-32 sm:pt-40 pb-24">
        <div className={sectionClass}>
          <span className="font-mono text-xs tracking-[0.35em] uppercase text-ash-400/70 block mb-4">Legal</span>
          <h1 className="text-4xl sm:text-5xl font-bold font-space mb-4 text-bone">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm font-mono mb-10">Last updated: October 2026</p>

          <p className={pClass}>
            This Privacy Policy explains how BLAKASH Game Studio (&quot;BLAKASH&quot;, &quot;we&quot;, &quot;us&quot;,
            &quot;our&quot;) collects, uses and protects information when you use our website at blakash.com
            (the &quot;Website&quot;) and our mobile game Doodle Tow (the &quot;App&quot;), together the
            &quot;Services&quot;.
          </p>

          <h2 className={h2Class}>Doodle Tow (The App)</h2>
          <p className={pClass}><strong className="text-zinc-300">In short: Doodle Tow does not collect, share or sell any personal information.</strong></p>
          <ul className="list-disc pl-5 space-y-3 mb-4">
            <li className={liClass}><strong className="text-zinc-300">No account or login.</strong> We never ask for your name, email, phone number, location, contacts, photos or any other personal information.</li>
            <li className={liClass}><strong className="text-zinc-300">No ads, no in-app purchases, no analytics and no tracking of any kind.</strong> No in-game chat.</li>
            <li className={liClass}><strong className="text-zinc-300">Saved on your device only.</strong> Your progress (levels, stars, coins, vehicles, style items, missions, high scores) and your settings are stored only on your own device. They are never sent to us. Uninstalling the App, or clearing its data in your device settings, deletes them permanently.</li>
            <li className={liClass}><strong className="text-zinc-300">Works offline.</strong> The App does not need the internet and does not ask for any special device permissions. The only exception is the &quot;made by BLAKASH&quot; link in Settings, which opens this Website in your browser.</li>
            <li className={liClass}><strong className="text-zinc-300">Game engine.</strong> The App is built with the Unity engine. We have switched off Unity&apos;s optional analytics, diagnostics and advertising services, so the App sends no data to Unity or any other third party.</li>
            <li className={liClass}><strong className="text-zinc-300">Google Play.</strong> When you download the App, Google may collect information under Google&apos;s own privacy policy (policies.google.com/privacy). If you have chosen to share usage and diagnostics with app developers in your Android settings, Google may give us anonymous, combined crash and performance statistics. These never identify you.</li>
          </ul>

          <h2 className={h2Class}>The Website</h2>

          <h3 className={h3Class}>Information We Collect</h3>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li className={liClass}><strong className="text-zinc-300">Collaborate form:</strong> your name, email address and any other details you choose to submit (for example your role, portfolio links or message). We use this only to reply to your inquiry.</li>
            <li className={liClass}><strong className="text-zinc-300">Basic page-visit data:</strong> the page path and referrer, to understand how the Website is used, in aggregate. We do not use third-party advertising trackers or analytics services.</li>
            <li className={liClass}><strong className="text-zinc-300">Server logs:</strong> like all websites, our hosting provider may automatically record technical information such as your IP address and browser type, for security and to keep the Website running.</li>
          </ul>

          <h3 className={h3Class}>How We Use It</h3>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li className={liClass}>To respond to collaboration, publishing or partnership inquiries</li>
            <li className={liClass}>To reply to you by email</li>
            <li className={liClass}>To understand overall Website traffic (not tied to your identity)</li>
          </ul>
          <p className={pClass}>We do not sell your information and we do not use it for advertising.</p>

          <h3 className={h3Class}>Service Providers</h3>
          <p className={pClass}>We use a few service providers to run the Website. They process data on our behalf:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li className={liClass}><strong className="text-zinc-300">Vercel</strong> – hosts the Website</li>
            <li className={liClass}><strong className="text-zinc-300">Neon</strong> – hosts our database (where form submissions are stored)</li>
            <li className={liClass}><strong className="text-zinc-300">Resend</strong> – delivers email notifications when you submit the Collaborate form</li>
          </ul>
          <p className={pClass}>We do not share your information with anyone else, except where required by law.</p>

          <h3 className={h3Class}>Cookies</h3>
          <p className={pClass}>
            The Website uses one strictly necessary cookie, only to keep our administrators securely logged in to
            the admin dashboard. It is never set for ordinary visitors and is not used for tracking or advertising.
          </p>

          <h3 className={h3Class}>Data Retention</h3>
          <p className={pClass}>
            We keep Collaborate form submissions only as long as reasonably needed to respond to you and keep a
            record of our conversation. You can ask us to delete them at any time.
          </p>

          <h2 className={h2Class}>Your Rights</h2>
          <p className={pClass}>
            Depending on where you live, you may have the right to access, correct or delete your personal
            information, or to object to or restrict how we use it. Doodle Tow holds no personal information
            about you; your game data is on your device and you can delete it at any time. For Website data,
            contact us using the details below.
          </p>

          <h2 className={h2Class}>Children&apos;s Privacy</h2>
          <p className={pClass}>
            Doodle Tow collects no personal information from anyone, including children. Our Services are not
            directed at children under 13, and we do not knowingly collect personal information from children
            through the Website. If you believe a child has sent us personal information, please contact us and
            we will delete it.
          </p>

          <h2 className={h2Class}>Changes to This Policy</h2>
          <p className={pClass}>
            We may update this Privacy Policy as the Website or our games change. When we do, we will change the
            &quot;Last updated&quot; date above, and we will clearly explain any significant change.
          </p>

          <h2 className={h2Class}>Contact Us</h2>
          <p className={pClass}>
            BLAKASH Game Studio<br />
            Website: <a href="https://www.blakash.com" className="text-ash-300 hover:text-ember-400 underline transition-colors duration-300">www.blakash.com</a><br />
            Email:{" "}
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=connect@blakash.com" target="_blank" rel="noopener noreferrer"
              className="text-ash-300 hover:text-ember-400 underline transition-colors duration-300">
              connect@blakash.com
            </a>
          </p>
        </div>
      </section>

      <ScrollToTop />
    </main>
  );
}
