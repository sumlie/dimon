import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const impact = localFont({
  src: "../fonts/Impact.woff2",
  variable: "--font-impact",
});

const inter = localFont({
  src: [
    {
      path: "../fonts/Inter-400.woff2",
      weight: "400",
    },
    {
      path: "../fonts/Inter-700.woff2",
      weight: "700",
    },
    {
      path: "../fonts/Inter-800.woff2",
      weight: "800",
    },
  ],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ДИМОН",
  description:
    "Одежда без рамок и единой идеи. Просто создаём то, что нравится нам и вам, и распространяем ДИМОНа дальше.",
};

export function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${impact.variable} antialiased`}>
      <body className="relative w-full">{children}</body>
    </html>
  );
}
