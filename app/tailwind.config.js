/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F4F4F5", // Zinc-100
        text: "#09090B", // Zinc-950
        primary: "#000000",
        secondary: "#52525B", // Zinc-600
        border: "#E4E4E7", // Zinc-200
        critical: "#DC2626", // Red-600
        success: "#16A34A", // Green-600
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        DEFAULT: '16px', // Rounded-xl equivalent, modern default
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      fontFamily: {
        sans: ["System"], // San Francisco on iOS, Roboto on Android
        mono: ["System"], // Monospaced numbers
      }
    },
  },
  plugins: [],
}
