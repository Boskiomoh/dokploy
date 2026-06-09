import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "87.5rem",
			},
		},
		extend: {
			fontFamily: {
				sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
			},
			screens: {
				"3xl": "1920px",
			},
			maxWidth: {
				"2xl": "40rem",
				"8xl": "85rem",
				"9xl": "95rem",
				"10xl": "105rem",
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "#0070f3",
					foreground: "#ffffff",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
				// ── Nobus brand palette ───────────────────────────────────────────
				nobus: {
					blue: "#0070f3",
					"blue-light": "#3291ff",
					"blue-dark": "#0050c8",
					cyan: "#00b4d8",
					dark: "#0a1628",
					"dark-mid": "#0b1a36",
					"dark-light": "#1a2a4a",
					slate: "#1e3a5f",
					muted: "#94a3b8",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"caret-blink": {
					"0%,70%,100%": {
						opacity: "1",
					},
					"20%,50%": {
						opacity: "0",
					},
				},
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
				"fillLevel": {
					"0%": { "clip-path": "inset(100% 0 0 0)" },
					"50%": { "clip-path": "inset(0% 0 0 0)" },
					"100%": { "clip-path": "inset(100% 0 0 0)" },
				},
			},
			animation: {
				"caret-blink": "caret-blink 1.25s ease-out infinite",
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"nobus-level": "fillLevel 2s ease-in-out infinite",
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		require("fancy-ansi/plugin"),
		require("@tailwindcss/typography"),
	],
} satisfies Config;

export default config;
