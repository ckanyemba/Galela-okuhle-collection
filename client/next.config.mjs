/** @type {import('next').NextConfig} */
const nextConfig = {
  // Plain env vars are server-only in Next.js. These two are public values (OAuth client ID
  // and API URL), so inline them into the browser bundle at build time.
  // Never add secrets here: everything in `env` ends up in the client bundle.
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    API_URL: process.env.API_URL || "",
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
