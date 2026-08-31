import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move the dev-mode indicator out of the bottom-left corner, where it
  // would otherwise sit on top of the sidebar's "Sign out" control.
  devIndicators: {
    position: "top-right",
  },
};

export default nextConfig;
