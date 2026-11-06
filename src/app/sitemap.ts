import type { MetadataRoute } from "next";

const BASE_URL = "https://site-55ede1455abe4e418b224063f15c7198.freebuff.page";

const ROUTES: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" }> = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/search", priority: 0.9, changeFrequency: "daily" },
  { path: "/analytics", priority: 0.7, changeFrequency: "weekly" },
  { path: "/dealers", priority: 0.6, changeFrequency: "weekly" },
  { path: "/guides", priority: 0.6, changeFrequency: "weekly" },
  { path: "/history", priority: 0.3, changeFrequency: "weekly" },
  { path: "/compare", priority: 0.5, changeFrequency: "weekly" },
  { path: "/favorites", priority: 0.5, changeFrequency: "weekly" },
  { path: "/saved", priority: 0.4, changeFrequency: "weekly" },
  { path: "/messages", priority: 0.3, changeFrequency: "weekly" },
  { path: "/my", priority: 0.4, changeFrequency: "weekly" },
  { path: "/account", priority: 0.3, changeFrequency: "weekly" },
  { path: "/new", priority: 0.8, changeFrequency: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-05T00:00:00.000Z");

  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
