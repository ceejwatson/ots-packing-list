import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Public_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Nav from "@/components/Navigation";
import PlanProvider from "@/components/PlanProvider";
import SiteFooter from "@/components/SiteFooter";
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
    apple: "/icon-192.png",
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
        <PlanProvider>
        <Nav />
        {children}
        <SiteFooter />
        </PlanProvider>
        <Analytics />
      </body>
    </html>
  );
}
