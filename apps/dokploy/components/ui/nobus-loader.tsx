/**
 * NobusLoader — "Level fill" spinner
 *
 * Renders the Nobus logo with a dimmed greyscale background copy and a
 * colour-accurate "fill" copy that is revealed from bottom-to-top using a
 * CSS clip-path animation (defined in globals.css as .animate-nobus-level),
 * giving the impression of liquid rising to a level inside the logo mark.
 */
export const NobusLoader = ({ size = 64 }: { size?: number }) => {
	const maskStyle = {
		WebkitMaskImage: 'url(/nobus-logo.png)',
		WebkitMaskSize: 'contain',
		WebkitMaskRepeat: 'no-repeat',
		WebkitMaskPosition: 'center',
	};

	return (
		<output
			className="relative flex items-center justify-center"
			aria-label="Loading…"
			style={{ width: size, height: size }}
		>
			{/* Base layer - dim blue (optional, removing if "remove background" was meant for the base layer, but let's keep a very faint track or completely remove it as requested) */}
			{/* Colour fill layer — animated clip-path reveals bottom-to-top */}
			<div className="absolute inset-0 overflow-hidden animate-nobus-level">
				<div
					className="w-full h-full bg-primary"
					style={maskStyle}
				/>
			</div>
		</output>
	);
};

/** Full-page centred loader — use in per-page loading states */
export const NobusPageLoader = () => (
	<div className="flex h-screen w-full items-center justify-center bg-transparent">
		<div className="flex flex-col items-center gap-4">
			<NobusLoader size={80} />
			<p className="text-sm text-primary tracking-widest uppercase animate-pulse font-medium">
				Nobus Cloud
			</p>
		</div>
	</div>
);
