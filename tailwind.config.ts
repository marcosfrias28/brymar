import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],

	theme: {
		extend: {
			screens: {
				smartphonexs: '320px',
				smartphone: '360px',
				tablet: '760px',
				laptop: '1024px',
				desktop: '1300px',
				ultrawide: '2440px',
			},
			backgroundImage: {
				'gradient-radial': `radial-gradient(at center, hsl(var(--primary)) 0%, transparent 40%),
                   radial-gradient(at center, hsl(var(--secondary)) 0%, transparent 59%)`,

				'aurora': `radial-gradient(circle at 30% 60%, hsl(var(--color-3)) 0%, hsl(var(--color-4)) 100%),
           radial-gradient(circle at 40% 80%, hsl(var(--secondary)) 0%, hsl(var(--color-3)) 80%)`
			},

			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			colors: {
				white: "#f7f7f7",
				arsenic: "hsl(213, 12%, 25%)",
				blackCoral: "hsl(220, 10%, 40%)",
				darkVanilla: "hsl(24, 24%, 75%)",
				azureishWhite: "hsl(162, 27%, 90%)",
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				secondaybackground: 'hsl(var(--color-5))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},

				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
			},
			keyframes: {
				auroraMove: {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' },
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'border-beam': {
					'100%': {
						'offset-distance': '100%'
					}
				},
				shine: {
					'0%': {
						'background-position': '0% 0%'
					},
					'50%': {
						'background-position': '100% 100%'
					},
					to: {
						'background-position': '0% 0%'
					}
				},
				marquee: {
					from: {
						transform: 'translateX(0)'
					},
					to: {
						transform: 'translateX(calc(-100% - var(--gap)))'
					}
				},
				'marquee-vertical': {
					from: {
						transform: 'translateY(0)'
					},
					to: {
						transform: 'translateY(calc(-100% - var(--gap)))'
					}
				},
			},
			animation: {
				gradient: 'auroraMove 6s ease infinite',
				'gradient-shift': 'gradient-shift 15s ease infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
				shine: 'shine var(--duration) infinite linear',
				marquee: 'marquee var(--duration) infinite linear',
				'marquee-vertical': 'marquee-vertical var(--duration) linear infinite'
			}
		},
	},
	plugins: [require('tailwindcss-animate')],
};

export default config;
