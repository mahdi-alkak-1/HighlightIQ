/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1C2FFF",
          link: "#104DC7",
          bg: "#111318",
          panel: "#151820",
          panelStrong: "#1B202A",
          border: "#262B36",
          text: "#FFFFFF",
          muted: "#9AA4B2",
          processing: "#C39624",
          ready: "#299170"
        }
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["Space Grotesk", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0, 0, 0, 0.45)",
        glow: "0 0 40px rgba(28, 47, 255, 0.25)",
      },
    },
  },
  plugins: [],
};
