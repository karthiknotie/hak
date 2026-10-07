import type { Metadata } from "next";

const SITE_URL = "https://www.blakash.com";
const HOME_TITLE = "BLAKASH — Indie Game Studio | Games, Portfolio & Studio";
const HOME_DESCRIPTION =
  "BLAKASH is an independent game studio crafting original games, immersive worlds, and unforgettable experiences. Explore our upcoming games, portfolio, and studio, or collaborate with us.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "BLAKASH",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/Image/hak-hero-v1.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/Image/hak-hero-v1.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BLAKASH",
  alternateName: ["BLAKASH Studio", "BLAKASH Game Studio"],
  url: SITE_URL,
  logo: `${SITE_URL}/logo/hak-logo.png`,
  sameAs: [
    "https://www.artstation.com/blakashstudio3",
    "https://www.youtube.com/@blakashstudio",
    "https://www.instagram.com/blakashstudio/",
    "https://x.com/blakashstudio",
    "https://www.linkedin.com/company/blakash/",
  ],
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {children}
    </>
  );
}
