/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        'primary-dark': '#004499',
        'primary-light': '#3388DD',
        success: '#00AA44',
        warning: '#FF9900',
        danger: '#CC0000',
        surface: '#FFFFFF',
        canvas: '#F5F5F5',
        border: '#EEEEEE',
        muted: '#CCCCCC',
        ink: '#1A1A1A',
        'ink-secondary': '#666666',
        'ink-muted': '#999999',
        sidebar: '#1E2A3B',
        'sidebar-hover': '#273548',
        'sidebar-active': '#0066CC',
        accent: '#5856D6',
        teal: '#00C7BE',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        h1: ['28px', { lineHeight: '1.3', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        sm: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        xs: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        badge: '20px',
      },
      spacing: {
        sidebar: '256px',
        topbar: '64px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
        modal: '0 20px 40px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
