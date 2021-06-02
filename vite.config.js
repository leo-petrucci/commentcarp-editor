const { resolve } = require("path");
import { viteSingleFile } from "vite-plugin-singlefile";
/**
 *
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [viteSingleFile()],
  server: {
    port: 9999,
  },
  build: {
    brotliSize: true,
    polyfillDynamicImport: false,
    rollupOptions: {
      input: {
        commentcarp: resolve(__dirname, "index.html"),
        template: resolve(__dirname, "template.html"),
      },
      output: {
        // entryFileNames: "assets/[name].js",
        manualChunks: () => "commentcarp.js",
      },
    },
  },
};
