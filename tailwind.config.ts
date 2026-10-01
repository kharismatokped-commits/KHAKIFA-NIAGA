import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#EEF0F8",
        foreground: "hsl(var(--foreground))",
        surface: "#F8F9FE",
        "surface-inset": "#E9ECF6",
        card: {
          DEFAULT: "#F8F9FE",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#146C43",
          foreground: "#FFFFFF",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#22c55e",
          600: "#16a34a",
          700: "#146C43",
          800: "#1B7A4A",
          900: "#14532d",
          light: "#2E9B63",
          dark: "#146C43",
          darker: "#0f4d30",
        },
        "accent-badge": "#E5484D",
        "text-primary": "#1F2340",
        "text-secondary": "#8A8FA8",
        "whatsapp-green": "#25D366",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          red: "#E5484D",
          orange: "#F57C00",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "#E2E6F2",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      boxShadow: {
        /* Soft UI / Neumorphism shadow presets */
        "nm-out":   "6px 6px 14px rgba(163,177,198,0.30), -6px -6px 14px rgba(255,255,255,0.92)",
        "nm-in":    "inset 4px 4px 9px rgba(163,177,198,0.28), inset -4px -4px 9px rgba(255,255,255,0.92)",
        "nm-card":  "8px 8px 18px rgba(163,177,198,0.28), -6px -6px 16px rgba(255,255,255,0.90)",
        "nm-heavy": "10px 10px 24px rgba(163,177,198,0.34), -8px -8px 20px rgba(255,255,255,0.94)",
        "nm-green": "0 12px 26px rgba(20,108,67,0.34)",
        "nm-hero":  "0 16px 32px rgba(20,108,67,0.30)",
        "nm-badge": "0 3px 8px rgba(229,72,77,0.45)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-roboto)", "Inter", "Roboto", "-apple-system", "sans-serif"],
        heading: ["var(--font-poppins)", "var(--font-roboto)", "Poppins", "Roboto", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
        roboto: ["var(--font-roboto)", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
