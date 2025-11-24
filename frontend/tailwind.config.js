/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ⚡ Permet de basculer le thème sombre avec une classe "dark"
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5', // Indigo
          dark: '#3730a3',
        },
        accent: '#f59e0b', // Jaune orangé
      },
      boxShadow: {
        'glow': '0 0 15px rgba(79,70,229,0.6)', // Effet lumineux
      },
    },
  },
  plugins: [],
};
