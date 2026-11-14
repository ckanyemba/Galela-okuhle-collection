import { SITE_URL } from "@/lib/site";

// /robots.txt: let search engines crawl the shop, keep private pages out, point to the sitemap.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/staff", "/cart", "/checkout", "/order/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
