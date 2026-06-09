import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NobusLoader } from "./nobus-loader";

/**
 * NobusRouteLoader
 *
 * Replaces the default NextTopLoader blue bar.
 * Shows a small Nobus logo spinner fixed to the bottom-right corner
 * while Next.js is navigating between pages.
 */
export const NobusRouteLoader = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const start = () => setLoading(true);
		const done = () => setLoading(false);

		router.events.on("routeChangeStart", start);
		router.events.on("routeChangeComplete", done);
		router.events.on("routeChangeError", done);

		return () => {
			router.events.off("routeChangeStart", start);
			router.events.off("routeChangeComplete", done);
			router.events.off("routeChangeError", done);
		};
	}, [router]);

	if (!loading) return null;

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
			aria-live="polite"
			aria-label="Navigating…"
		>
			{/* Subtle dark backdrop — doesn't block clicks */}
			<div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />

			{/* Centred Nobus logo level-fill spinner */}
			<div className="relative flex flex-col items-center gap-3">
				<NobusLoader size={72} />
				<span className="text-xs tracking-widest uppercase text-muted-foreground animate-pulse select-none">
					Nobus Cloud
				</span>
			</div>
		</div>
	);
};
