const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  prefix: "cc-",
  purge: {
    enabled: process.env.NODE_ENV === "production",
    safeList: [],
    content: ["./index.html", "./template.html", "./src/**/*.js"],
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      typography: ["dark"],
    },
  },
  theme: {
    extend: {
      fontWeight: ["hover", "focus"],
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        orange: colors.orange,
      },
      typography(theme) {
        return {
          dark: {
            css: {
              color: theme("colors.gray.300"),
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
                borderColor: theme("colors.gray.700"),
                borderWidth: 1,
              },
              ul: {
                margin: ".5rem 0",
              },
              blockquote: {
                margin: ".5rem 0",
                color: theme("colors.gray.300"),
                borderLeftColor: theme("colors.gray.700"),
              },
            },
          },
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
        };
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
