import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Primary font with Montserrat fallback
        sans: ["Metropolis", "Montserrat", "system-ui", "sans-serif"],
        metropolis: ["Metropolis", "Montserrat", "sans-serif"],
      },
      fontSize: {
        // Custom Hakiardhi Typography Scale
        "display-lg": [
          "4.5rem",
          { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" },
        ], // 72px - Hero
        "display-md": [
          "3.5rem",
          { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.02em" },
        ], // 56px - Page Headers
        "display-sm": [
          "3rem",
          { lineHeight: "1.2", fontWeight: "600", letterSpacing: "-0.01em" },
        ], // 48px - Section Headers
        "heading-xl": [
          "2.25rem",
          { lineHeight: "1.25", fontWeight: "600" },
        ], // 36px
        "heading-lg": [
          "1.875rem",
          { lineHeight: "1.3", fontWeight: "600" },
        ], // 30px
        "heading-md": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }], // 24px
        "heading-sm": ["1.25rem", { lineHeight: "1.5", fontWeight: "600" }], // 20px
        "body-lg": ["1.125rem", { lineHeight: "1.7", fontWeight: "400" }], // 18px
        "body-md": ["1rem", { lineHeight: "1.7", fontWeight: "400" }], // 16px
        "body-sm": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }], // 14px
        caption: ["0.75rem", { lineHeight: "1.5", fontWeight: "500" }], // 12px
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      colors: {
        hakiardhi: {
          red: "#D62828",
          "red-dark": "#b71c1c",
          "red-light": "#FBEAEA",
          black: "#000000",
          white: "#FFFFFF",
        },
        brand: {
          25: "#fef5f5",
          50: "#fbeaea",
          100: "#f8d7d7",
          200: "#f1aeae",
          300: "#ea8686",
          400: "#e35d5d",
          500: "#D62828",
          600: "#b71c1c",
          700: "#9a1515",
          800: "#7d1111",
          900: "#600d0d",
          950: "#3e0808",
        },
        "blue-light": {
          25: "#f5fbff",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#b9e6fe",
          300: "#7cd4fd",
          400: "#36bffa",
          500: "#0ba5ec",
          600: "#0086c9",
          700: "#026aa2",
          800: "#065986",
          900: "#0b4a6f",
          950: "#062c41",
        },
        orange: {
          25: "#fffaf5",
          50: "#fff6ed",
          100: "#ffead5",
          200: "#fddcab",
          300: "#feb273",
          400: "#fd853a",
          500: "#fb6514",
          600: "#ec4a0a",
          700: "#c4320a",
          800: "#9c2a10",
          900: "#7e2410",
          950: "#511c10",
        },
        success: {
          25: "#f6fef9",
          50: "#ecfdf3",
          100: "#d1fadf",
          200: "#a6f4c5",
          300: "#6ce9a6",
          400: "#32d583",
          500: "#12b76a",
          600: "#039855",
          700: "#027a48",
          800: "#05603a",
          900: "#054f31",
          950: "#053321",
        },
        error: {
          25: "#fffbfa",
          50: "#fef3f2",
          100: "#fee4e2",
          200: "#fecdca",
          300: "#fda29b",
          400: "#f97066",
          500: "#f04438",
          600: "#d92d20",
          700: "#b42318",
          800: "#912018",
          900: "#7a271a",
          950: "#55160c",
        },
        warning: {
          25: "#fffcf5",
          50: "#fffaeb",
          100: "#fef0c7",
          200: "#fedf89",
          300: "#fec84b",
          400: "#fdb022",
          500: "#f79009",
          600: "#dc6803",
          700: "#b54708",
          800: "#93370d",
          900: "#7a2e0e",
          950: "#4e1d09",
        },
        gray: {
          25: "#fcfcfd",
          50: "#f9fafb",
          100: "#f2f4f7",
          200: "#e4e7ec",
          300: "#d0d5dd",
          400: "#98a2b3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1d2939",
          900: "#101828",
          950: "#0c111d",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.05)",
        card: "0 4px 12px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px rgba(211, 47, 47, 0.15)",
        "theme-xs": "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        "theme-sm": "0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
        "theme-md": "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
        "theme-lg": "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
        "theme-xl": "0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)",
        "focus-ring": "0px 0px 0px 4px rgba(211, 47, 47, 0.12)",
      },
      backdropBlur: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        fade: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(214, 40, 40, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(214, 40, 40, 0.6)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "slide-in": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite linear",
        spin: "spin 1s linear infinite",
        fade: "fade 1s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        gradient: "gradient-shift 8s ease infinite",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [
    function ({ addComponents, addUtilities }: any) {
      // Hakiardhi Components
      const components = {
        // Buttons
        ".btn-primary": {
          backgroundColor: "#D62828",
          color: "#FFFFFF",
          padding: "0.625rem 1.5rem",
          borderRadius: "0.75rem",
          fontWeight: "600",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#000000",
            color: "#FFFFFF",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        ".btn-secondary": {
          backgroundColor: "#D62828",
          color: "#FFFFFF",
          border: "1px solid #D62828",
          borderRadius: "0.75rem",
          padding: "0.625rem 1.5rem",
          fontWeight: "600",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#000000",
            color: "#FFFFFF",
            borderColor: "#000000",
          },
        },

        // Card shimmer placeholder
        ".card-loader": {
          background:
            "linear-gradient(90deg, #f0f0f0 25%, #ffffff 50%, #f0f0f0 75%)",
          backgroundSize: "400% 100%",
          animation: "shimmer 1.5s infinite linear",
          borderRadius: "1rem",
          minHeight: "120px",
        },

        // Cards
        ".card": {
          backgroundColor: "#FFFFFF",
          borderRadius: "1rem",
          padding: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(211, 47, 47, 0.15)",
          },
        },

        // Sidebar base style
        ".sidebar": {
          backgroundColor: "#FFFFFF",
          width: "250px",
          borderRight: "1px solid #EEE",
          transition: "width 0.3s ease",
        },
        ".sidebar-item": {
          display: "flex",
          alignItems: "center",
          padding: "12px 20px",
          color: "#000",
          borderRadius: "12px",
          margin: "4px 8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#f9f9f9",
          },
        },
        ".sidebar-item-active": {
          backgroundColor: "#D32F2F",
          color: "#FFF",
          "&:hover": {
            backgroundColor: "#b71c1c",
          },
        },

        // Navigation
        ".hakiardhi-topnav": {
          position: "sticky",
          top: "0",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: "50",
          borderBottom: "1px solid #eee",
        },

        // Data Table
        ".table-header": {
          backgroundColor: "#D62828",
          color: "#FFF",
          fontWeight: "600",
        },
        ".table-row:nth-child(even)": {
          backgroundColor: "#FAFAFA",
        },
      };

      // Loaders & Utilities
      const utilities = {
        ".loader-orbital": {
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "#D62828",
          animation: "spin 1s linear infinite",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "0",
            left: "0",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#FFFFFF",
            opacity: "0.5",
            animation: "fade 1s ease-in-out infinite",
          },
        },
        ".text-balance": {
          textWrap: "balance",
        },
        ".card-hakiardhi": {
          borderRadius: "1rem",
          backgroundColor: "#FFFFFF",
          padding: "1.5rem",
          boxShadow: "0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
        },
        ".hakiardhi-section": {
          paddingTop: "4rem",
          paddingBottom: "4rem",
          "@media (min-width: 640px)": {
            paddingTop: "5rem",
            paddingBottom: "5rem",
          },
          "@media (min-width: 1024px)": {
            paddingTop: "6rem",
            paddingBottom: "6rem",
          },
        },
        ".hakiardhi-container": {
          width: "100%",
          maxWidth: "1280px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          "@media (min-width: 1024px)": {
            paddingLeft: "3rem",
            paddingRight: "3rem",
          },
        },
      };

      addComponents(components);
      addUtilities(utilities, ["responsive", "hover"]);
    },
  ],
};

export default config;
