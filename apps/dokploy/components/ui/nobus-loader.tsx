/**
 * NobusLoader — "Level fill" spinner
 *
 * Renders the Nobus logo with a dimmed greyscale background copy and a
 * colour-accurate "fill" copy that is revealed from bottom-to-top using a
 * CSS clip-path animation (defined in globals.css as .animate-nobus-level),
 * giving the impression of liquid rising to a level inside the logo mark.
 */
export const NobusLoader = ({ size = 64 }: { size?: number }) => {
	return (
		<output
			className="relative flex items-center justify-center"
			aria-label="Loading…"
			style={{ width: size, height: size }}
		>
			{/* Dim greyscale base layer */}
			{/* biome-ignore lint/performance/noImgElement: loader asset */}
			<img
				src="/nobus-logo.png"
				alt=""
				aria-hidden="true"
				className="absolute inset-0 w-full h-full object-contain opacity-15 grayscale"
			/>

			{/* Colour fill layer — animated clip-path reveals bottom-to-top */}
			<div className="absolute inset-0 overflow-hidden animate-nobus-level">
				{/* biome-ignore lint/performance/noImgElement: loader asset */}
				<img
					src="/nobus-logo.png"
					alt="Loading…"
					className="w-full h-full object-contain"
				/>
			</div>
		</output>
	);
};

/** Full-page centred loader — use in per-page loading states */
export const NobusPageLoader = () => (
	<div className="flex h-screen w-full items-center justify-center bg-background">
		<div className="flex flex-col items-center gap-4">
			<NobusLoader size={80} />
			<p className="text-sm text-muted-foreground tracking-widest uppercase animate-pulse">
				Nobus Cloud
			</p>
		</div>
	</div>
);
