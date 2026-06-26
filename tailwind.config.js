/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind to look at every file in app and components
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
