import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

const TITLE = "Terms of Service";
const DESCRIPTION = "BLAKASH Terms of Service — the terms that apply to using blakash.com.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.blakash.com/terms" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://www.blakash.com/terms",
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
const pClass = "text-zinc-400 leading-7 mb-4";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-32 sm:pt-40 pb-24">
        <div className={sectionClass}>
          <span className="font-mono text-xs tracking-[0.35em] uppercase text-ash-400/70 block mb-4">Legal</span>
          <h1 className="text-4xl sm:text-5xl font-bold font-space mb-4 text-bone">Terms of Service</h1>
          <p className="text-zinc-500 text-sm font-mono mb-10">Last updated: October 2026</p>

          <p className={pClass}>
            These Terms of Service (&quot;Terms&quot;) govern your use of blakash.com (the
            &quot;Website&quot;), operated by BLAKASH Game Studio (&quot;we&quot;, &quot;us&quot;,
            &quot;our&quot;). By using the Website, you agree to these Terms.
          </p>

          <h2 className={h2Class}>Using the Website</h2>
          <p className={pClass}>
            You may browse the Website and use the Collaborate form to contact us for legitimate
            purposes — partnerships, publishing inquiries, collaboration, contract work, or job
            inquiries. You agree not to misuse the Website, including attempting to disrupt its
            operation, submit false information, or access areas of the site you&apos;re not
            authorized to access (such as the admin dashboard).
          </p>

          <h2 className={h2Class}>Intellectual Property</h2>
          <p className={pClass}>
            The BLAKASH name, logo, and all game titles, artwork, and content on this Website
            (including Mr. Edward and Doodle Tow) are the property of BLAKASH unless otherwise
            noted. You may not copy, reproduce, or use our branding, artwork, or game content
            without our prior written permission.
          </p>

          <h2 className={h2Class}>Submissions</h2>
          <p className={pClass}>
            When you submit information through our Collaborate form, you confirm that the
            information you provide is accurate and that you have the right to share it with us.
            See our <a href="/privacy" className="text-ash-300 hover:text-ember-400 underline transition-colors duration-300">Privacy Policy</a>{" "}
            for how we handle that information.
          </p>

          <h2 className={h2Class}>No Warranty</h2>
          <p className={pClass}>
            The Website and its content (including information about games still in development)
            are provided &quot;as is&quot;, without warranties of any kind. Game details, release
            dates, and features described on this Website are subject to change as development
            progresses.
          </p>

          <h2 className={h2Class}>Limitation of Liability</h2>
          <p className={pClass}>
            To the extent permitted by law, BLAKASH is not liable for any indirect, incidental,
            or consequential damages arising from your use of the Website.
          </p>

          <h2 className={h2Class}>Changes to These Terms</h2>
          <p className={pClass}>
            We may update these Terms from time to time. We will update the &quot;Last
            updated&quot; date above when we do. Continuing to use the Website after changes take
            effect means you accept the updated Terms.
          </p>

          <h2 className={h2Class}>Contact Us</h2>
          <p className={pClass}>
            Questions about these Terms? Contact us at{" "}
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=connect@blakash.com" target="_blank" rel="noopener noreferrer"
              className="text-ash-300 hover:text-ember-400 underline transition-colors duration-300">
              connect@blakash.com
            </a>.
          </p>
        </div>
      </section>

      <ScrollToTop />
    </main>
  );
}
