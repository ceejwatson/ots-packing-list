import type { Metadata } from "next";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "Track your Air Force OTS packing readiness, key pre-arrival deadlines, and quick links to reporting instructions and the official Orientation Guide.",
  alternates: { canonical: "/dashboard" },
  openGraph: {
    title: "OTS Readiness Overview — Air Force Officer Training School",
    description:
      "Track your Air Force OTS packing readiness and key pre-arrival deadlines.",
    url: "/dashboard",
  },
};

export default function OverviewPage() {
  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <DashboardClient />
    </main>
  );
}
