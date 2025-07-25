import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   host: true, // allow external access (mobile)
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:3000", // local backend
  //       changeOrigin: true,
  //     },
  //   },
  //   allowedHosts: [
  //     "dff9d0f76783.ngrok-free.app", // optional (for Vite v5+)
  //   ],
  // },
});
