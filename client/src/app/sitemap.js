import { getProducts } from "@/lib/api";
import { SITE_URL, absoluteUrl } from "@/lib/site";

// Rebuild hourly so new or edited products appear without a redeploy.
export const revalidate = 3600;

/**
 * /sitemap.xml: public shop pages only. Cart, checkout, receipts and the staff area
 * are private or per-customer, so they are left out (and disallowed in robots.txt).
 */
export default async function sitemap() {
  const products = await getProducts();
  const latest = products.reduce((max, p) => (p.updatedAt && new Date(p.updatedAt) > max ? new Date(p.updatedAt) : max), new Date(0));
  const lastModified = latest.getTime() > 0 ? latest : new Date();

  const pages = [
    { url: SITE_URL, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/shop?category=bags`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/shop?category=cleaning`, lastModified, changeFrequency: "weekly", priority: 0.8 },
  ];

  const productPages = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : lastModified,
    changeFrequency: "weekly",
    priority: p.featured ? 0.8 : 0.7,
    images: (p.images || []).slice(0, 5).map((img) => absoluteUrl(img.url)),
  }));

  return [...pages, ...productPages];
}
