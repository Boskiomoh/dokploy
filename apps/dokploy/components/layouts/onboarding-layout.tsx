import type React from "react";
import { useWhitelabelingPublic } from "@/utils/hooks/use-whitelabeling";

interface Props {
	children: React.ReactNode;
}
export const OnboardingLayout = ({ children }: Props) => {
	const { config: whitelabeling } = useWhitelabelingPublic();
	const appName = whitelabeling?.appName || "Dokploy";
	const appDescription =
		whitelabeling?.appDescription ||
		"\u201CThe Open Source alternative to Netlify, Vercel, Heroku.\u201D";
	const logoUrl =
		whitelabeling?.loginLogoUrl || whitelabeling?.logoUrl || undefined;

	return (
		<div className="container relative min-h-svh flex-col items-center justify-center flex lg:max-w-none lg:grid lg:grid-cols-2 lg:px-0 w-full">
			<div className="relative hidden h-full flex-col items-center justify-center p-10 text-primary dark:border-r lg:flex overflow-hidden">
				<div className="absolute inset-0 bg-[#060c17] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-[#0d1e3d] via-[#060c17] to-[#040810]" />
				<div 
					className="absolute inset-0"
					style={{
						backgroundImage: "repeating-radial-gradient(circle at 100% 50%, transparent 0, transparent 60px, rgba(255,255,255,0.03) 61px, transparent 62px)"
					}}
				/>
				<img 
					src="/nobus-logo.png" 
					alt="Nobus" 
					className="relative z-20 w-56 drop-shadow-2xl" 
				/>
			</div>
			<div className="w-full">
				<div className="flex w-full flex-col justify-center space-y-6 max-w-lg mx-auto">
					{children}
				</div>
			</div>
		</div>
	);
};
