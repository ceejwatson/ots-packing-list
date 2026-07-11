import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const siteUrl = "https://otspackinglist.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "OTS Packing List (2026) | Air Force Officer Training School Checklist",
    template: "%s | OTS Packing List",
  },
  description:
    "Free interactive Air Force OTS packing list for Maxwell AFB. Track 100+ required and recommended items, official document checklist, FAQs, and reporting instructions for Officer Training School.",
  keywords: [
    "OTS packing list",
    "Air Force OTS packing list",
    "Officer Training School packing list",
    "what to bring to OTS",
    "Maxwell AFB OTS",
    "OTS checklist 2026",
    "Air Force officer training",
    "USSF OTS packing",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "OTS Packing List",
    title: "OTS Packing List | Air Force Officer Training School Checklist",
    description:
      "Free interactive packing list for Air Force OTS at Maxwell AFB. Track every required item, document, and uniform before you report.",
    images: [{ url: "/ots-shield.png", width: 241, height: 249, alt: "OTS Shield" }],
  },
  twitter: {
    card: "summary",
    title: "OTS Packing List | Air Force OTS Checklist",
    description:
      "Free interactive packing list for Air Force OTS at Maxwell AFB.",
    images: ["/ots-shield.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
