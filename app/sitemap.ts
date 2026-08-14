import type { MetadataRoute } from "next";
import { SITE } from "@/lib/siteConfig";

const ROUTES = ["/", "/join", "/producers", "/producer-signup", "/about", "/faq", "/contact", "/terms", "/privacy", "/disclaimer", "/login"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
  }));
}
