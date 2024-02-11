/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
    darkMode: ['class'],
    content: ['./emails/**/*.{ts,tsx}'],
    prefix: '',
    theme: {
        extend: {
            colors: {
                muted: {
                    DEFAULT: '#f4f4f5',
                    foreground: '#52525b',
                },
            },
        },
    },
};

export default tailwindConfig;
