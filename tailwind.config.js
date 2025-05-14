/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables class-based dark mode
  content: [
      './src/**/*.{js,ts,jsx,tsx}',
      './app/**/*.{js,ts,jsx,tsx}',
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: {
          light: '#f8fafc', // slate-50
          DEFAULT: '#e2e8f0', // slate-200
          dark: '#cbd5e1', // slate-300
        },
        secondary: {
          light: '#f1f5f9', // slate-100
          DEFAULT: '#e2e8f0', // slate-200
          dark: '#94a3b8', // slate-400
        },
        accent: {
          light: '#6366f1', // indigo-500
          DEFAULT: '#4f46e5', // indigo-600
          dark: '#4338ca', // indigo-700
        },
        
        // Dark mode colors
        dark: {
          primary: {
            light: '#1e293b', // slate-800
            DEFAULT: '#0f172a', // slate-900
            dark: '#020617', // slate-950
          },
          secondary: {
            light: '#334155', // slate-700
            DEFAULT: '#1e293b', // slate-800
            dark: '#0f172a', // slate-900
          },
          accent: {
            light: '#818cf8', // indigo-400
            DEFAULT: '#6366f1', // indigo-500
            dark: '#4f46e5', // indigo-600
          },
        }
      },
      backgroundColor: {
        light: {
          primary: '#ffffff',
          secondary: '#f8fafc', // slate-50
        },
        dark: {
          primary: '#0f172a', // slate-900
          secondary: '#1e293b', // slate-800
        }
      },
      textColor: {
        light: {
          primary: '#0f172a', // slate-900
          secondary: '#334155', // slate-700
        },
        dark: {
          primary: '#f8fafc', // slate-50
          secondary: '#e2e8f0', // slate-200
        }
      },
      borderColor: {
        light: {
          DEFAULT: '#e2e8f0', // slate-200
          strong: '#cbd5e1', // slate-300
        },
        dark: {
          DEFAULT: '#334155', // slate-700
          strong: '#475569', // slate-600
        }
      }
    },
  },
  plugins: [],
}