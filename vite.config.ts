const { resolve } = require("path");
import { viteSingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [viteSingleFile()],
  server: {
    port: 9999,
  },
  build: {
    brotliSize: true,
    polyfillDynamicImport: false,
    emptyOutDir: true,
    minify: "terser",
    terserOptions: {
      keep_fnames: true,
    },
    rollupOptions: {
      input: {
        commentcarp: resolve(__dirname, "index.html"),
        template: resolve(__dirname, "template.html"),
      },
      output: {
        entryFileNames: "assets/commentcarp.js",
        manualChunks: () => "commentcarp.js",
      },
    },
  },
});
