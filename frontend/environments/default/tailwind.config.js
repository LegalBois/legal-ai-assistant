import { getTailwindConfigWithColors } from '../tailwindConfigCreator.js';

/** @type {import('tailwindcss').Config} */
export default getTailwindConfigWithColors({
  primary: {
    50: '#EDFAFF',
    100: '#D6F3FF',
    200: '#426BF2',
    300: '#23B2FF',
    400: '#0B95FF',
    500: '#0C6ACF',
    600: '#105598',
    700: '#0F345C',
    gradient: '#7042CF',
  },
  white: '#ffffff',
  black: '#0C0C0E',
  'msg-bg-start': '#7042CF',
  'msg-bg-end': '#0C6ACF',
  greeting: '#0F345C',
  transparent: 'transparent',
});
