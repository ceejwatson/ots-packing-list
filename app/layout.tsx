import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Public_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Nav from "@/components/Nav";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = "https://otspackinglist.com";
const siteTitle = "OTS Packing List";
const siteDescription =
  "The complete Air Force Officer Training School packing checklist and preparation tracker, current to the CAO 27 March 2026 Orientation Guide.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteTitle} — Air Force OTS Prep & Checklist`,
    template: `%s — ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: siteTitle,
  keywords: [
    "OTS packing list",
    "Air Force Officer Training School",
    "OTS checklist",
    "Maxwell AFB OTS",
    "OTS reporting instructions",
    "OTS FAQ",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteTitle,
    title: `${siteTitle} — Air Force OTS Prep & Checklist`,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteTitle} — Air Force OTS Prep & Checklist`,
    description: siteDescription,
  },
  icons: {
    icon: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${barlowCondensed.variable}`}
    >
      <body className="bg-stone-50 text-stone-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>
        <Nav />
        {children}
        <footer
          className="border-t border-stone-200 mt-16"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center space-y-3">
            <p className="font-display uppercase tracking-widest text-sm text-stone-500">
              Always with Honor
            </p>
            <p className="text-xs text-stone-500">
              Officer Training School &middot; Maxwell AFB, Alabama
            </p>
            <p className="text-xs leading-relaxed text-stone-500 max-w-2xl mx-auto">
              This site participates in the Amazon Services LLC Associates
              Program. Purchases through our links may earn a small commission
              at no cost to you, which helps keep this resource free. Product
              recommendations are based on utility for OTS, not affiliate
              relationships. Not an official Department of the Air Force site
              &mdash; always defer to the official Orientation Guide and your
              welcome email.
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
