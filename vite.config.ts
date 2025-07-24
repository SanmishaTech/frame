import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   host: true, // 👈 allow external access (required for ngrok to work from mobile)
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:3000", // backend
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, ""),
  //     },
  //   },
  //   allowedHosts: [
  //     "f3b58e3cdfec.ngrok-free.app", // replace with your current ngrok domain
  //   ],
  // },
});
