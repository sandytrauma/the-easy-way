import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keeps the library out of the client bundle
  serverExternalPackages: ["pdfjs-dist"],

  
};

export default nextConfig;