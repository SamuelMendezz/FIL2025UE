/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ESTA ES LA PARTE NUEVA QUE ARREGLA LOS COLORES
  safelist: [
    'border-emerald-500', 'text-emerald-600',
    'border-blue-500',    'text-blue-600',
    'border-purple-500',  'text-purple-600',
    'border-orange-500',  'text-orange-600',
    'border-orange-600',  'bg-slate-900', // Colores de Admin
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}