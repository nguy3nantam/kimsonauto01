/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c98e00', // Màu vàng hoàng kim sang trọng chuẩn logo Kim Sơn Automobiles
          dark: '#9a6700',   // Vàng đồng trầm ấm, uy quyền
          light: '#e4b92f',  // Vàng kim loại ánh sáng từ swoosh xe
          subtle: '#fefce8', // Nền vàng kem nhạt thanh nhã
        },
        secondary: {
          DEFAULT: '#0f1117', // Đen tuyền sang trọng từ logo Kim Sơn
          light: '#1a1d26',
          muted: '#282c37',
        },
        brand: {
          gold: '#e4b92f',
          amber: '#c98e00',
          bronze: '#9a6700',
          dark: '#0f1117',
          silver: '#94a3b8',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      lineHeight: {
        'viet-tight': '1.25',
        'viet-snug': '1.38',
        'viet-normal': '1.6',
        'viet-relaxed': '1.75',
      },
      letterSpacing: {
        'viet-title': '-0.015em',
        'viet-wide': '0.05em',
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(201, 142, 0, 0.45)',
        'glow-lg': '0 0 35px -5px rgba(228, 185, 47, 0.5)',
        'premium': '0 20px 30px -10px rgba(15, 17, 23, 0.12)',
      }
    },
  },
  plugins: [],
}
