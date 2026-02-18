import path from "node:path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "etf-finder",
      project: "javascript-react",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: "../api/public/**",
        filesToDeleteAfterUpload: "../api/public/**/*.map",
      },
      disable: process.env.NODE_ENV !== "production",
    }),
  ],
  build: {
    outDir: path.resolve(import.meta.dirname, "../api/public"),
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
