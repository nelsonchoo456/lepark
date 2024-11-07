const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */

const dirname = __dirname + '/apps/staff-frontend';
const visitorDirname = __dirname + '/apps/visitor-frontend';

module.exports = {
  content: [
    join(
      dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    join(
      visitorDirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(dirname),
    ...createGlobPatternsForDependencies(visitorDirname),
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#e6f0ed',  // very light, subtle green
          100: '#c4dbd4',
          200: '#9bbfb6',
          300: '#73a397',
          400: '#6da696',  // slightly darker than 500
          500: '#558f7f',  // updated key green shade
          600: '#466f65',
          700: '#375f54',
          800: '#2b4d43',
          900: '#1f3b32',  // deep, muted green
        },
        indigoGrey: {
          50: '#e8f2ff',
          100: '#f8f8f8',
          200: '#c5d4e6',
          300: '#bdcadb',
          400: '#adb9c9',
          500: '#a0abba',
          600: '#919cab',
          700: '#818b99',
          800: '#727b87',
          900: '#646b75',
        },
        gray: {
          900: '#202225',
          800: '#2f3136',
          700: '#36393f',
          600: '#4f545c',
          400: '#d4d7dc',
          300: '#e3e5e8',
          200: '#ebedef',
          100: '#f2f3f5',
        },
        sky: {
          50:  '#e2f6fb',  // very light, almost gray-blue
          100: '#c4eaf7',
          200: '#a1def2',
          300: '#7dd3ee',
          400: '#28B4E2',  // bright sky blue
          500: '#229cc7',
          600: '#1c83a6',
          700: '#166b86',
          800: '#115366',
          900: '#0b3c47',  // deep, muted blue with gray undertones
        },
        mustard: {
          50:  '#fdf5e6',  // very light, almost pale yellow
          100: '#fbebcc',
          200: '#f7d999',
          300: '#f2c666',
          400: '#eeb432',
          500: '#DC9600',  // rich mustard yellow
          600: '#b87800',
          700: '#945a00',
          800: '#704200',
          900: '#4b2b00',  // deep, muted brownish yellow
        },
        // highlightGreen: {
        //   50:  '#edf7f2',  // very light, vibrant green
        //   100: '#d3eadb',
        //   200: '#a8d9bd',
        //   300: '#7bc89f',
        //   400: '#59b586',  // slightly darker, more saturated
        //   500: '#39a26d',  // key highlight green shade
        //   600: '#2f8758',
        //   700: '#266b46',
        //   800: '#1e5236',
        //   900: '#153923',  // deep, vibrant green
        // },
        // highlightGreen: {
        //   50:  '#e3fced',  // lighter, vibrant mint green
        //   100: '#c0f7d9',  // fresh, minty green
        //   200: '#8bf0b9',  // brighter, more saturated green
        //   300: '#53e597',  // vibrant green with a hint of warmth
        //   400: '#2edc81',  // slightly warmer, bolder green
        //   500: '#1ac870',  // new highlight shade, vibrant
        //   600: '#16a95e',  // rich green, slightly darker
        //   700: '#13864b',
        //   800: '#0e6237',
        //   900: '#084026',  // dark, vivid green
        // },
        highlightGreen: {
          50:  '#eaf8f0',  // very light, balanced green
          100: '#cdeedd',  // soft, natural light green
          200: '#9fe2bb',  // subtle, fresh green
          300: '#70d69a',  // moderate vibrancy
          400: '#4fc683',  // warm, approachable green
          500: '#39b36d',  // slightly toned down highlight
          600: '#2f9458',  // deeper and natural, but still vibrant
          700: '#267649',  
          800: '#1d5939',
          900: '#143d27',  // dark but balanced green
        },
        pastelPink: {
          50:  '#fff5f7',  // very light, almost white pink
          100: '#ffe5eb',  
          200: '#ffccd5',  
          300: '#ffb3c0',  
          400: '#ff99aa',  
          500: '#ff8094',  // soft pastel pink
          600: '#e67384',  
          700: '#cc6673',  
          800: '#b35962',  
          900: '#994d52',  // slightly deeper, soft pink
        },
      },
      // -- [ Responsive Config ] --
      screens: {
        sm: '640px',
        // => @media (min-width: 640px) { ... }
        md: '768px',
        // => @media (min-width: 768px) { ... }
        lg: '1024px',
        // => @media (min-width: 1024px) { ... }
        xl: '1280px',
        // => @media (min-width: 1280px) { ... }
        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      },

      // -- [ Sizes ] --
      height: {
        '18': '4.5rem',
      },
      width: {
        '18': '4.5rem',
      },

      // -- [ Shadows ] --
      boxShadow: {
        'custom': '3px 3px 5px rgba(0, 0, 0, 0.3)',
        'hoverCustom': '3px 3px 5px rgba(0, 0, 0, 0.35)',
      },

      // -- [ Animations ] --
      animation: {
        slideIn: 'slideIn 200ms ease-out forwards',
        hide: 'hide 200ms ease-in forwards',
        swipeOut: 'swipeOut 200ms ease-in forwards',
        slideDown: 'slideDown 200ms ease-out',
        slideUp: 'slideUp 200ms ease-out',
        slideUpAndFade: "slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        hide: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        swipeOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        slideDown: {
          '0%': { height: '0' },
          '100%': { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          '0%': { height: 'var(--radix-accordion-content-height)' },
          '100%': { height: '0' },
        },
        slideUpAndFade: {
          from: { opacity: 0, transform: "translateY(2px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
      }
      addUtilities(newUtilities);
    }
  ],
};
