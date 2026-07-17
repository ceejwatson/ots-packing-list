import type { Metadata } from "next";
import { faqs } from "@/lib/faqs-data";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common Air Force OTS questions: length, location, phones, smart watches, laptops, money, medications, and what to bring on Day 1.",
  alternates: { canonical: "/faqs" },
  openGraph: {
    title: "OTS FAQs — Common Questions About Officer Training School",
    description:
      "Answers to common Air Force OTS questions: length, location, phones, smart watches, laptops, money, medications, and what to bring on Day 1.",
    url: "/faqs",
  },
};

export default function FaqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
