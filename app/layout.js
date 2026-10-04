import "./globals.css";
import { Space_Grotesk, Inter } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata = {
  title: "Night Canteen Runner",
  description: "Track delivery requests, the runner's schedule, and who actually got fed.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-canvas text-ink antialiased font-sans">{children}</body>
    </html>
  );
}
