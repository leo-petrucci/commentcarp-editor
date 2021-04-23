const { resolve } = require("path");
/**
 *
 * @type {import('vite').UserConfig}
 */
export default {
  server: {
    port: 9999,
  },
  build: {
    brotliSize: true,
    rollupOptions: {
      input: {
        commentcarp: resolve(__dirname, "index.html"),
        template: resolve(__dirname, "template.html"),
      },
      output: {
        entryFileNames: "assets/[name].js",
      },
    },
  },
};
