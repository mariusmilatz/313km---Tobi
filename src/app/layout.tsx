import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tobi Runs the Eifelsteig | Round Circle Films",
  description:
    "313 km. 7 days. One trail across the Eifel. Follow Tobi's self-supported run of the Eifelsteig, from Aachen to Trier — a documentary by Round Circle Films.",
  // TODO: add a real Open Graph image once key art from the shoot is available.
  openGraph: {
    title: "Tobi Runs the Eifelsteig",
    description: "313 km. 7 days. One trail across the Eifel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-paper text-graphite">{children}</body>
    </html>
  );
}
