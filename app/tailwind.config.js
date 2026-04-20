/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F0F2F5", // Slate-50/100ish - Fundo geral suave
        surface: "#FFFFFF", // Branco puro para cards
        
        // Brand Colors - Teal Moderno
        primary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488', // Main Brand Color
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },

        // Neutrals - Slate (Blue-ish Grey)
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155', // Main Text
          800: '#1E293B', // Headings
          900: '#0F172A',
        },

        // Semantic
        text: "#1E293B", // Slate-800
        textLight: "#64748B", // Slate-500
        border: "#E2E8F0", // Slate-200
        
        critical: "#EF4444", // Red-500
        success: "#10B981", // Emerald-500
        warning: "#F59E0B", // Amber-500
        info: "#3B82F6", // Blue-500

        // Tactical Medical Tokens
        clinical: {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        tactical: {
          cyan: '#22D3EE',
          emerald: '#10B981',
          amber: '#F59E0B',
          slate: '#94A3B8',
        }
      },
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '16px', 
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(15, 23, 42, 0.05)',
        'md': '0 4px 6px rgba(15, 23, 42, 0.1)',
        'lg': '0 10px 15px rgba(15, 23, 42, 0.1)',
        'tactical': '0 0 10px rgba(34, 211, 238, 0.1)',
      },
      fontFamily: {
        sans: ["System"], 
        mono: ["monospace", "Courier New"],
      }
    },
  },
  plugins: [],
}
