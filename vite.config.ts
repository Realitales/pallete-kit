import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ["src"],
      exclude: ["dev", "**/*.test.*", "**/*.stories.*"],
      tsconfigPath: "./tsconfig.build.json",
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      '@lib': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Palette",
      formats: ["es", "cjs"],
      fileName: (format) => `palette.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        /^@radix-ui\/.*/,
        "framer-motion",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    sourcemap: true,
  },
  server: {
    allowedHosts: ["df15-212-78-247-6.ngrok-free.app"],
  },
});
