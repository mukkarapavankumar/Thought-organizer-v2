import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thought Organizer",
  description: "Take control of your thoughts and ideas with AI that follows your rules.",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      }
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Thought Organizer",
    description: "Take control of your thoughts and ideas with AI that follows your rules.",
    type: "website",
  },
  twitter: {
    title: "Thought Organizer",
    description: "Take control of your thoughts and ideas with AI that follows your rules.",
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
