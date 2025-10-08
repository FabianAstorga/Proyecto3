/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        brandYellow: '#F5C518', // amarillo
        brandBlue: '#1E3A8A',   // azul
        brandGray: '#111827'    // gris oscuro
      }
    },
  },
  plugins: [],
}
