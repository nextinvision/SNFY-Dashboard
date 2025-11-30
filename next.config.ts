import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: The lockfile warning is informational and doesn't affect functionality.
  // It occurs because Next.js detects multiple package-lock.json files in parent directories.
  // This is safe to ignore - Next.js will use the correct lockfile in this directory.
};

export default nextConfig;
