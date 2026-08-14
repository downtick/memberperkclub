import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilityToggle from "@/components/AccessibilityToggle";
import IconSprite from "@/components/IconSprite";
import { SITE } from "@/lib/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | A membership that pays for itself`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "A members-only savings club: travel rates below public pricing, cruise excursions, business services, and home and auto savings. Become a member for $149 a year — everything online, nothing to carry.",
  keywords: [
    "membership savings club",
    "travel discount membership",
    "hotel discount membership",
    "member benefits program",
    "business discount club",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} | A membership that pays for itself`,
    description:
      "A members-only savings club: travel rates, business services, and everyday savings. Become a member for $149 a year.",
    url: SITE.url,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: "Travel rates, business services, and everyday savings for members.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        {/* One sprite for the whole document; <Icon /> references its symbols. */}
        <IconSprite />
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main" className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <AccessibilityToggle />
      </body>
    </html>
  );
}
