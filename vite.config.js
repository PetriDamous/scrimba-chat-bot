import { defineConfig } from "vite";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.VITE_SUPABASE_URL_LC_CHATBOT);

export default defineConfig({
  server: {
    proxy: {
      "/supabase": {
        target: "https://ebckajyphbndzavznxcf.supabase.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase/, ""),
      },
    },
  },
});
