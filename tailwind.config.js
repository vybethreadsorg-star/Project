/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    black: "#050505",
                    dark: "#0a0a0c",
                    pink: "#FF00FF",
                    purple: "#9D00FF",
                    cyan: "#00FFFF",
                    blue: "#0066FF",
                    grey: "#1a1a1f"
                }
            },
            fontFamily: {
                sans: ['Rajdhani', 'sans-serif'],
                cyber: ['Orbitron', 'sans-serif'],
            },
            boxShadow: {
                'neon-pink': '0 0 5px #FF00FF, 0 0 20px #FF00FF',
                'neon-cyan': '0 0 5px #00FFFF, 0 0 20px #00FFFF',
                'neon-purple': '0 0 5px #9D00FF, 0 0 20px #9D00FF',
            },
            backgroundImage: {
                'cyber-gradient': 'linear-gradient(135deg, #050505 0%, #0a0a0c 100%)',
                'neon-gradient': 'linear-gradient(90deg, #FF00FF 0%, #9D00FF 50%, #00FFFF 100%)',
            }
        },
    },
    plugins: [],
}
