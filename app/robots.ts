import type { MetadataRoute } from "next";
import { SITE } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/producer", "/api", "/post-login", "/auth", "/unsubscribed"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
