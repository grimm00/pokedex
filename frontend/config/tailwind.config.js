/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Ensure type badge classes are always included
    'type-fire',
    'type-water',
    'type-grass',
    'type-electric',
    'type-psychic',
    'type-ice',
    'type-dragon',
    'type-dark',
    'type-fairy',
    'type-normal',
    'type-fighting',
    'type-flying',
    'type-poison',
    'type-ground',
    'type-rock',
    'type-bug',
    'type-ghost',
    'type-steel',
  ],
  theme: {
    extend: {
      colors: {
        // Default Tailwind colors
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Pokemon type colors (classic Pokemon colors)
        'fire': '#F08030',      // Classic fire orange
        'water': '#6890F0',     // Classic water blue
        'grass': '#78C850',     // Classic grass green
        'electric': '#F8D030',  // Classic electric yellow
        'psychic': '#F85888',   // Classic psychic pink
        'ice': '#98D8D8',       // Classic ice light blue
        'dragon': '#7038F8',    // Classic dragon purple
        'dark': '#705848',      // Classic dark brown
        'fairy': '#EE99AC',     // Classic fairy pink
        'normal': '#A8A878',    // Classic normal gray
        'fighting': '#C03028',  // Classic fighting red
        'flying': '#A890F0',    // Classic flying purple
        'poison': '#A040A0',    // Classic poison purple
        'ground': '#E0C068',    // Classic ground yellow-brown
        'rock': '#B8A038',      // Classic rock brown
        'bug': '#A8B820',       // Classic bug green
        'ghost': '#705898',     // Classic ghost purple
        'steel': '#B8B8D0',     // Classic steel gray
      },
      fontFamily: {
        'pokemon': ['Pokemon', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'pokemon': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'pokemon-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
