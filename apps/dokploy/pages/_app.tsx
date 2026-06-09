import "@/styles/globals.css";

import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";
import { ThemeProvider } from "next-themes";
import { NobusRouteLoader } from "@/components/ui/nobus-route-loader";
import type { ReactElement, ReactNode } from "react";
import { SearchCommand } from "@/components/dashboard/search-command";
import { WhitelabelingProvider } from "@/components/proprietary/whitelabeling/whitelabeling-provider";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/utils/api";

const inter = Inter({ subsets: ["latin"] });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode;
	theme?: string;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

const MyApp = ({
	Component,
	pageProps: { ...pageProps },
}: AppPropsWithLayout) => {
	const getLayout = Component.getLayout ?? ((page) => page);

	return (
		<>
			<style jsx global>
				{`
					:root {
						--font-inter: ${inter.style.fontFamily};
					}
				`}
			</style>
			<Head>
				<title>Nobus Cloud</title>
			</Head>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
				forcedTheme={Component.theme}
			>
				<NobusRouteLoader />
				<WhitelabelingProvider />
				<Toaster richColors />
				<SearchCommand />
				{getLayout(<Component {...pageProps} />)}
			</ThemeProvider>
		</>
	);
};

export default api.withTRPC(MyApp);
