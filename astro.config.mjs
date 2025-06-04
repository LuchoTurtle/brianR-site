// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import favicons from "astro-favicons";

import webmanifest from "astro-webmanifest";

export default defineConfig({
  vite: {
    assetsInclude: ["**/*.glsl"],
    plugins: [tailwindcss()],
  },
  site: "https://www.djbrianrodrigues.com/",
  integrations: [
    favicons(),
    webmanifest({
      name: "Brian Rodrigues - Portuguese Wedding DJ in NJ",
      icon: "public/favicon.svg",
      short_name: "Brian DJ",
      description: "Professional bilingual DJ with 20+ years experience specializing in weddings, corporate events, and celebrations in New Jersey.",
      start_url: "/",
      theme_color: "#263b91",
      background_color: "#263b91",
      display: "standalone",
    }),
  ],
});
