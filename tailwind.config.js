const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          extend: "dark",
          colors: {
            background: "#09090b", // Zinc 950
            foreground: "#ECEDEE", // Text Light
            content1: "#18181b", // Zinc 900
            content2: "#27272a", // Zinc 800
            divider: "#27272a", // Subtle Borders
            focus: "#6366f1", // Indigo 500
          },
          layout: {
            radius: {
              medium: "8px",
              large: "14px",
            },
          },
        },
      },
    }),
  ],
};
