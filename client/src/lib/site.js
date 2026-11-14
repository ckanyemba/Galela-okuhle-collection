// Canonical public URL of the storefront (used for sitemap, robots and metadata).
export const SITE_URL = (process.env.SITE_URL || "https://www.galelaokuhlecollection.co.za").replace(/\/$/, "");

/** Turn a stored image path (/products/x.jpg or a Cloudinary URL) into an absolute URL. */
export const absoluteUrl = (url) => (/^https?:\/\//.test(url) ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`);
