import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OTS FAQs - Common Questions About Officer Training School",
  description:
    "Answers to common Air Force OTS questions: length, location, phones, smart watches, laptops, money, medications, and what to bring on Day 1.",
  alternates: { canonical: "/faqs" },
};

export default function FaqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
