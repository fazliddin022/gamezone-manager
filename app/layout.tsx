import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameZone Manager",
  description: "PlayStation va Kompyuter xona boshqaruv tizimi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={geist.variable}>
      <body style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}