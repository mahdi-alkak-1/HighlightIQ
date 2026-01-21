import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const spaFallback = () => ({
  name: "spa-fallback",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url || req.method !== "GET") {
        return next();
      }
      const accept = req.headers.accept ?? "";
      if (!accept.includes("text/html")) {
        return next();
      }
      if (req.url.startsWith("/@") || req.url.startsWith("/node_modules")) {
        return next();
      }
      if (req.url.includes(".") || req.url.startsWith("/api")) {
        return next();
      }
      req.url = "/index.html";
      return next();
    });
  },
});

export default defineConfig({
  plugins: [react(), spaFallback()],
  appType: "spa",
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/recordings": {
        target: "http://localhost:8080",
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) {
            return "/index.html";
          }
          return undefined;
        },
      },
      "/clips": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/clip-candidates": {
        target: "http://localhost:8080",
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) {
            return "/index.html";
          }
          return undefined;
        },
      },
      "/youtube-publishes": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/dashboard/pipeline": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
