import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/recordings": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/clips": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/clip-candidates": {
        target: "http://localhost:8080",
        changeOrigin: true,
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
