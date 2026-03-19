import "@/styles/globals.css";
import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "CampConnect",
	description: "Connecting students, faculty and administration",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const _dmSerif = DM_Serif_Display({
	subsets: ["latin"],
	weight: "400",
	style: ["normal", "italic"],
	variable: "--font-dm-serif",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={`${geist.variable}`} lang="en">
			<body>
				<Toaster position="top-right" richColors />
				<TRPCReactProvider>
					<TooltipProvider>{children}</TooltipProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
