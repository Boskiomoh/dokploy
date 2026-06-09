import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * NobusLoader — bottom-to-top fill animation using the Nobus logo PNG as a CSS mask.
 * The PNG is used as a mask so the blue fill reveals from bottom to top.
 */
export const NobusLoader = ({ size = 64 }: { size?: number }) => {
	const maskStyle: React.CSSProperties = {
		WebkitMaskImage: "url(/nobus-logo.png)",
		maskImage: "url(/nobus-logo.png)",
		WebkitMaskSize: "contain",
		maskSize: "contain",
		WebkitMaskRepeat: "no-repeat",
		maskRepeat: "no-repeat",
		WebkitMaskPosition: "center",
		maskPosition: "center",
	};

	return (
		<div
			className="relative flex items-center justify-center"
			aria-label="Loading…"
			style={{ width: size, height: size }}
		>
			{/* Faint ghost track */}
			<div
				className="absolute inset-0 opacity-15"
				style={{ ...maskStyle, backgroundColor: "#0070f3" }}
			/>
			{/* Animated blue fill — reveals bottom-to-top */}
			<div
				className="absolute inset-0 nobus-fill"
				style={{ ...maskStyle, backgroundColor: "#0070f3" }}
			/>
		</div>
	);
};

export const NobusPageLoader = () => (
	<div className="flex h-screen w-full items-center justify-center bg-background">
		<div className="flex flex-col items-center gap-4">
			<NobusLoader size={80} />
			<p className="text-sm text-[#0070f3] tracking-widest uppercase animate-pulse font-medium">
				Nobus Cloud
			</p>
		</div>
	</div>
);

/**
 * NobusRouteLoader — shows the Nobus logo fill animation as a full-screen overlay
 * during Next.js page transitions.
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
			<div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
			<div className="relative flex flex-col items-center gap-3">
				<NobusLoader size={100} />
				<p className="text-xs text-[#0070f3] tracking-widest uppercase animate-pulse font-medium">
					Nobus Cloud
				</p>
			</div>
		</div>
	);
};
