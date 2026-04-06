import type { Metadata } from "next"
import { Inter, Public_Sans } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const publicSans = Public_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Wildmelder — Wildunfall-Notruf-Assistent",
  description:
    "Wildunfall? Jetzt Jäger und Polizei schnell und einfach benachrichtigen. GPS-Standort, Schritt-für-Schritt-Anleitung und Dokumentation.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
         <SpeedInsights />
      </body>
    </html>
  )
}
