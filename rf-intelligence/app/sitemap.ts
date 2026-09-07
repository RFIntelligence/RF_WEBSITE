import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rfintelligenceco.com";

  const routes = [
    { path: "", changeFrequency: "weekly", priority: 1.0 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/services", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries", changeFrequency: "monthly", priority: 0.7 },
    { path: "/benefits", changeFrequency: "monthly", priority: 0.7 },
    { path: "/why-rf", changeFrequency: "monthly", priority: 0.7 },
    { path: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
    { path: "/book-a-demo", changeFrequency: "monthly", priority: 0.9 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/legal/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/data-processing", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/cookie-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/ai-disclaimer", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/security", changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}