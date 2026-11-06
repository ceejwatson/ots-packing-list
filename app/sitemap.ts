import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://otspackinglist.com";
  const lastModified = new Date("2026-11-06");

  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/what-to-bring`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/reporting`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/faqs`, lastModified, changeFrequency: "weekly", priority: 0.8 },
  ];
}
