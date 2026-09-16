import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
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
  description: "Exceptional pre-owned English saddles. Shipping and escrow only.",
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
          <main className="w-full flex-1">{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
