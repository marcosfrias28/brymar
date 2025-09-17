const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Basic rules that don't require additional plugins
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
];