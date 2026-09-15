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
    "Congress mobile MVP for pre-owned English saddles: Present Your Saddle, Explore the Collection, Details, and the founder queue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${sourceSans.variable} ${ibmPlex.variable} flex min-h-dvh flex-col bg-ivory font-sans text-espresso antialiased`}
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
