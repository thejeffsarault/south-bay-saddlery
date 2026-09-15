import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import { MobileDock, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-sans",
});

const ibmPlex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: {
    default: "South Bay Saddlery",
    template: "%s · South Bay Saddlery",
  },
  description:
    "Mobile-first marketplace for pre-owned English saddles: Sell Your Saddle, Collection, Details, and founder approval.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/brand/SBS-favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${sourceSans.variable} ${ibmPlex.variable} flex min-h-dvh flex-col bg-sbs-bg font-sans text-sbs-text antialiased`}
      >
        <StoreProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-8 sm:pb-16">
            {children}
          </main>
          <SiteFooter />
          <MobileDock />
        </StoreProvider>
      </body>
    </html>
  );
}
