/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'destructive-100': 'var(--color-destructive-100)',
        'destructive-200': 'var(--color-destructive-200)',
        'success-100': 'var(--color-success-100)',
        'success-200': 'var(--color-success-200)',
        'primary-200': 'var(--color-primary-200)',
        'dark-100': 'var(--color-dark-100)',
        'dark-200': 'var(--color-dark-200)',
        'input': 'var(--color-input)',
        'light-100': 'var(--color-light-100)',
      },
    },
  },
  plugins: [],
};
