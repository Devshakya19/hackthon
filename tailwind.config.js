module.exports = {
	content: ['./src/**/*.{ts,tsx,js,jsx,html}'],
	theme: {
		extend: {
			colors: {
				primary: '#00f0ff',
				indigo: '#4f46e5',
				bg: '#050505',
				'bg-soft': '#0e0e0e',
				'bg-glass': 'rgba(255, 255, 255, 0.03)',
				'text-900': '#ffffff',
				'text-500': '#a1a1aa',
				'neon-blue': '#00f0ff',
				'neon-purple': '#bf00ff'
			},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				display: ['"Space Grotesk"', 'Outfit', 'Inter', 'sans-serif']
			},
			keyframes: {
				float: {
					'0%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
					'100%': { transform: 'translateY(0)' }
				},
				marquee: {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' }
				},
				glow: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.6' }
				}
			},
			animation: {
				float: 'float 6s ease-in-out infinite',
				marquee: 'marquee 25s linear infinite',
				glow: 'glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: []
}
