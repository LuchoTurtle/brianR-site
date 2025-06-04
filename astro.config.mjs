// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import favicons from "astro-favicons";

export default defineConfig({
  vite: {
    assetsInclude: ["**/*.glsl"],
    plugins: [tailwindcss()],
  },
  integrations: [favicons()],
    site: 'https://www.djbrianrodrigues.com/',
});
