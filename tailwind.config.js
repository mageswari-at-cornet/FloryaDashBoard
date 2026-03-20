/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#B05B43',
                    dark: '#8A3A2C',
                    light: '#8A5A5C',
                    dim: 'rgba(176, 91, 67, 0.08)',
                },
                surface: {
                    DEFAULT: '#FDFBF7',
                    elevated: '#F4EFEA',
                    highlight: '#EFE8E2',
                },
                aura: {
                    dark: '#2D2926',
                }
            },
            fontFamily: {
                serif: ['Playfair Display', 'serif'],
                sans: ['Manrope', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
