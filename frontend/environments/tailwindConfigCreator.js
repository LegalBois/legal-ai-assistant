export const getTailwindConfigWithColors = colors => {
  return {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      colors: {
        gray: {
          50: '#FCFCFC',
          100: '#E5E5E5',
          200: '#CECECE',
          300: '#EAEAEE',
          400: '#8F94AF',
          500: '#6C6B99',
          600: '#46456F',
        },
        blue: {
          300: '#343488',
          400: '#414081',
          500: '#13134E',
          800: '#1A1A33',
          900: '#2D2D55',
        },
        primary: {
          100: '#D6F3FF',
          200: '#426BF2',
        },
        red: {
          100: '#E12121',
        },
        purple: {
          100: '#7042CF',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Helvetica', 'Arial', 'sans-serif'],
      },
      extend: {
        borderRadius: {
          full: '9999px',
          'product-card': '24px',
          'animated-bar': '60px',
        },
        animation: {
          'bounce-slow': 'bounce-slow 1s infinite',
          static: 'animate-bar 4s linear infinite',
          intensive: 'animate-bar 1.5s linear infinite',
          'pulse-custom': 'pulse 2.5s linear infinite',
          'pulse-delay': 'pulse 2.5s linear infinite 0.6s',
          fadeIn: 'fadeIn 1.5s ease-in forwards',
          fadeOut: 'fadeOut 1.5s ease-out forwards',
        },
        keyframes: {
          'bounce-slow': {
            '0%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-40%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
            '100%': { transform: 'translateY(0)' },
          },
          pulse: {
            '0%': { transform: 'scale(0.5)', opacity: '0' },
            '50%': { opacity: '1' },
            '100%': { transform: 'scale(1.6)', opacity: '0' },
          },
          'animate-bar': {
            '0%': { height: '100%' },
            '50%': { height: '20%' },
            '100%': { height: '100%' },
          },
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          fadeOut: {
            '0%': { opacity: '1' },
            '100%': { opacity: '0', display: 'none' },
          },
        },
        colors,
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-msg': `linear-gradient(239deg, ${colors['msg-bg-start']} -10.25%, ${colors['msg-bg-end']} 103.37%)`,
          'bar-intensive': 'linear-gradient(213deg, rgba(112, 66, 207, 0.90) -11.43%, rgba(12, 106, 207, 0.90) 177.4%)',
          'bar-static': 'linear-gradient(204deg, rgba(112, 66, 207, 0.90) -30.93%, rgba(12, 106, 207, 0.90) 119.43%)',
        },
        gradientColorStopPositions: {
          'msg-start': '0%',
          'msg-end': '103.37%',
          'msg-list-start': '-30.11%',
          'msg-list-end': '153.58%',
        },
        gridTemplateRows: {
          main: 'auto 1fr auto',
          view: '1fr auto',
          '2fr-1fr': '2fr 1fr',
        },
        gridTemplateColumns: {
          '1fr-auto': '1fr auto',
          'auto-1fr': 'auto 1fr',
        },
        typography: ({ theme }) => ({
          DEFAULT: {
            css: {
              lineHeight: '1.5',
              h3: {
                marginTop: '1.2rem',
              },
            },
          },
          white: {
            css: {
              '--tw-prose-body': theme('colors.white'),
            },
          },
        }),
        maxWidth: {
          'widget-sm': '320px',
          widget: '393px',
        },
        maxHeight: {
          msg: '16rem',
          'welcome-img': '608px',
        },
        fontSize: {
          welcome: '32px',
          '2xs': '0.625rem',
          '3xs': '0.5rem',
        },
        padding: {
          'welcome-text': '22px',
        },
        width: {
          'welcome-text': '326px',
          'small-bubble': '17px',
          'product-card': '350px',
          'widget-sm': '320px',
          'animated-bar': '108px',
          widget: '393px',
          msg: '19rem',
        },
        height: {
          'small-bubble': '17px',
          'product-card': '29.625rem',
          'animated-bar': '165px',
          'animated-bar-intensive': '180px',
        },
        spacing: {
          'welcome-text': '177px',
        },
        boxShadow: {
          'blue-shadow': '0px 8px 32px 0px rgba(52, 52, 136, 0.70)',
          'blue-shadow-top': '0px -8px 32px 0px rgba(52, 52, 136, 0.70)',
          'unread-msg': '0px 6px 24px 0px rgba(26, 26, 51, 0.40);',
          scanner: '0 0 0 9999px rgba(0, 0, 0, 0.5);',
        },
        screens: {
          xs: '400px',
        },
        letterSpacing: {
          title: '0.64px',
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
      require('tailwindcss/plugin')(({ addUtilities }) => {
        addUtilities({
          '.break-word-legacy': {
            wordBreak: 'break-word',
          },
        });
      }),
      require('tailwindcss/plugin')(({ matchUtilities, theme }) => {
        matchUtilities(
          {
            'animate-delay': value => ({
              animationDelay: value,
            }),
          },
          {
            values: theme('transitionDelay'),
          },
        );
      }),
      require('tailwindcss-animation-delay'),
    ],
  };
};
