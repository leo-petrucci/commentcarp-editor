const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === "production",
    // classes that are generated dynamically, e.g. `rounded-${size}` and must
    // be kept
    safeList: [],
    content: [
      "./index.html",
      "./template.html",
      "./src/**/*.vue",
      "./src/**/*.js",
      // etc.
    ],
  },
  variants: {
    extend: {
      opacity: ["disabled"],
    },
  },
  theme: {
    extend: {
      fontWeight: ["hover", "focus"],
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      typography: {
        DEFAULT: {
          css: {
            "code::before": false,
            "code::after": false,
            "blockquote p:first-of-type::before": false,
            "blockquote p:first-of-type::after": false,
            "ul li p": false,
            p: {
              margin: ".5rem 0",
            },
            pre: {
              margin: ".5rem 0",
            },
            ul: {
              margin: ".5rem 0",
            },
            blockquote: {
              margin: ".5rem 0",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
