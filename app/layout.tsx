import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OTS Packing List",
  description: "Officer Training School packing list and preparation tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
