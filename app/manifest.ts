import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Accounts Assists",
    short_name: "Accounts Assists",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/LogoAA.png", sizes: "192x192", type: "image/png" },
      { src: "/LogoAA.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

