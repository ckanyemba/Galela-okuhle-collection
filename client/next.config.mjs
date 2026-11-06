/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only NEXT_PUBLIC_* vars reach the browser by default. These two are public values
  // (OAuth client ID and API URL), so inline them at build time under their Vercel names.
  // Never add secrets here: everything in `env` ends up in the client bundle.
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    API_URL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "",
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
