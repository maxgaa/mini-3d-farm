import { defineConfig } from "vite";

export default defineConfig({
  server: {
    // localhost only; use host: true to expose on the LAN
    host: "localhost",
    port: 5173,
  },
});
