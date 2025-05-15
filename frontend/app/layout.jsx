import { Geist, Geist_Mono } from "next/font/google";
import SiteLayout from "./components/SiteLayout";
import Web3Provider from "./components/Web3Provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata = {
  title: "VidVerse - Zora",
  description:
    "VidVerse is a decentralized video platform that allows users to upload, share, and monetize their videos with zora protocol"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Web3Provider>
          <SiteLayout>{children}</SiteLayout>
        </Web3Provider>
      </body>
    </html>
  );
}
