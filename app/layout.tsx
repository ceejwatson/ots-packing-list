import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "OTS Packing List",
  description:
    "Officer Training School packing checklist and preparation tracker, current to the CAO 27 March 2026 Orientation Guide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-stone-50 text-stone-900 antialiased">
        <Nav />
        {children}
        <footer className="border-t border-stone-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center space-y-3">
            <p className="font-display uppercase tracking-widest text-sm text-stone-500">
              Always with Honor
            </p>
            <p className="text-xs text-stone-400">
              Officer Training School &middot; Maxwell AFB, Alabama
            </p>
            <p className="text-[11px] leading-relaxed text-stone-400 max-w-2xl mx-auto">
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
