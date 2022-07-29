const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  prefix: 'cc-',
  content: ['./index.html', './template.html', './src/**/*.js'],
  safelist: ['tippy-*'],
  theme: {
    extend: {
      fontWeight: ['hover', 'focus'],
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        orange: colors.orange,
      },
      DEFAULT: {
        css: {
          'code::before': false,
          'code::after': false,
          'blockquote p:first-of-type::before': false,
          'blockquote p:first-of-type::after': false,
          'ul li p': false,
          p: {
            margin: '.5rem 0',
          },
          pre: {
            margin: '.5rem 0',
          },
          ul: {
            margin: '.5rem 0',
          },
          blockquote: {
            margin: '.5rem 0',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
