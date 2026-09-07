import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mixtape Memories | Audio Guestbook",
  description: "A timeless, luxury digital audio guestbook web application.",
  keywords: ["audio guestbook", "wedding guestbook", "cassette tape", "digital guestbook"],
  openGraph: {
    title: "Mixtape Memories - Audio Guestbook",
    description: "Leave a timeless voice message for the couple.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-stone-950 text-stone-100 selection:bg-stone-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}
