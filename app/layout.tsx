import type { Metadata } from "next";
import { Bricolage_Grotesque, Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import TopNav from "@/components/TopNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", style: ["italic", "normal"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Fantasy MLP",
  description: "Salary-cap fantasy for Major League Pickleball. Private leagues with your friends.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} ${fraunces.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
