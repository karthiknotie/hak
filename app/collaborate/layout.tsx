import type { Metadata } from "next";

const SITE_URL = "https://www.blakash.com/collaborate";
const TITLE = "Collaborate With BLAKASH";
const DESCRIPTION =
  "Partner with BLAKASH — pitch a project, apply to join the team, or propose a creative collaboration with our indie game studio.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE_URL,
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

export default function CollaborateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
