/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Type errors still fail the build; this only skips lint-only issues so
    // a stray style rule can't block a deploy. Safe to remove once the
    // project has a CI step that runs `next lint` separately.
    ignoreDuringBuilds: true,
  },
  images: {
    // TODO: add remotePatterns here once real photo/video hosting (e.g. Supabase Storage,
    // Cloudinary, or a CDN) is connected for daily update media.
    remotePatterns: [],
  },
};

export default nextConfig;
