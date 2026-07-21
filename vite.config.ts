import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "The Herbalists Tome",
        short_name: "HerbalistsTome",
        description:
          "A digital leather-bound herbal encyclopedia by Dominik Zeiler",
        theme_color: "#2a1810",
        background_color: "#f0e2c4",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json,ico,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "tome-data",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/images\/plants\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "tome-plant-images",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
