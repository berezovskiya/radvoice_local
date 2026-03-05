/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme surface colors
        'surface-0': '#0f1117',       // deepest background
        'surface-1': '#161822',       // panels
        'surface-2': '#1e2030',       // cards, sections
        'surface-3': '#262840',       // elevated elements, hover
        'surface-4': '#2e3150',       // active states

        // Border colors
        'border-subtle': '#2a2d3e',
        'border-default': '#363952',
        'border-strong': '#4a4e6a',

        // Traceability colors (dark-adjusted)
        'trace-normal': '#1e2030',
        'trace-modified': '#172554',
        'trace-mapped': '#14532d',
        'trace-unmapped': '#431407',
        'trace-hover': '#3b0764',

        // Accent colors
        'accent-blue': '#3b82f6',
        'accent-green': '#22c55e',
        'accent-red': '#ef4444',
        'accent-orange': '#f97316',
        'accent-purple': '#a855f7',
      },
    },
  },
  plugins: [],
}
