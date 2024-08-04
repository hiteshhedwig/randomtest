/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./@/**/*.{js,jsx,ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(350, 100%, 60%)", // Warm red
          foreground: "hsl(350, 100%, 98%)",
        },
        secondary: {
          DEFAULT: "hsl(25, 100%, 50%)", // Orange
          foreground: "hsl(25, 100%, 98%)",
        },
        accent: {
          DEFAULT: "hsl(45, 100%, 50%)", // Gold
          foreground: "hsl(45, 100%, 20%)",
        },
        muted: {
          DEFAULT: "hsl(30, 20%, 90%)",
          foreground: "hsl(30, 20%, 30%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(30, 20%, 20%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 100%, 40%)",
          foreground: "hsl(0, 100%, 98%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(30, 20%, 20%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-40vh) rotate(180deg)' },
          '100%': { transform: 'translateY(-80vh) rotate(360deg)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: 'float 20s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}