// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import favicons from "astro-favicons";

export default defineConfig({
  vite: {
    assetsInclude: ["**/*.glsl"],
    plugins: [tailwindcss()],
  },
  site: "https://www.djbrianrodrigues.com/",
  integrations: [
    favicons({
      name: "DJ Brian Rodrigues - Professional Wedding & Event DJ",
      short_name: "DJ Brian R.",
      icons: {
        android: [
          "android-chrome-192x192.png",
          {
            name: "android-chrome-512x512.png",
            sizes: [{ width: 512, height: 512 }],
            purpose: "maskable",
            transparent: true,
            rotate: false,
            offset: 13,
          },
        ],
        appleIcon: ["apple-touch-icon.png", "apple-touch-icon-precomposed.png", "safari-pinned-tab.svg"],
        appleStartup: false,
        favicons: true,
        windows: true,
        yandex: true,
      },
    }),
  ],
});
