/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // TODO: add remotePatterns here once real photo/video hosting (e.g. Supabase Storage,
    // Cloudinary, or a CDN) is connected for daily update media.
    remotePatterns: [],
  },
};

export default nextConfig;
