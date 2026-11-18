/** Static export: no server, no API routes, no runtime network access. */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
};
export default nextConfig;
