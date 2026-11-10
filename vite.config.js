import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // shows the Network URL so phones on the same Wi-Fi can open the site
    port: 5173,
    proxy: { "/api": "http://localhost:4000" },
  },
  preview: {
    host: true,
  },
});
