import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#3525cd",
        "on-primary": "#ffffff",
        "primary-container": "#4f46e5",
        "on-primary-container": "#dad7ff",
        secondary: "#58579b",
        "on-secondary": "#ffffff",
        "secondary-container": "#b6b4ff",
        "on-secondary-container": "#454386",
        tertiary: "#7e3000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#a44100",
        "on-tertiary-container": "#ffd2be",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        surface: "#f9f9ff",
        "on-surface": "#111c2d",
        "surface-variant": "#d8e3fb",
        "on-surface-variant": "#464555",
        outline: "#777587",
        "outline-variant": "#c7c4d8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "surface-container": "#e7eeff",
        "surface-container-high": "#dee8ff",
        "surface-container-highest": "#d8e3fb",
      },
      fontFamily: {
        headline: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-inter)", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.5rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px"
      },
    },
  },
  plugins: [],
} satisfies Config;
