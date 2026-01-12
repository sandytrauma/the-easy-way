import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This helps Next.js handle the binary/complex parts of PDF.js
  serverExternalPackages: ["pdfjs-dist"],
  turbopack: {
  },
  

};

export default nextConfig;