import { Montserrat, JetBrains_Mono } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SiteHeader } from "@/components/site-header"
import { siteMarkDataUri } from "@/components/site-mark"
import { Separator } from "@/components/ui/separator"
import { SiteFooter } from "@/components/site-footer"
import { cn } from "@/lib/utils"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Hunter Colson",
    template: "%s — Hunter Colson",
  },
  description:
    "Personal site of Hunter Colson. Writing about medicine, engineering, and AI.",
  icons: {
    icon: siteMarkDataUri,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(montserrat.variable, mono.variable)}
    >
      <body className="min-h-svh font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider>
            <div className="mx-auto flex min-h-svh w-full max-w-[72rem] flex-col px-6 md:px-8">
              <SiteHeader />
              <main className="flex-1 pt-6 pb-12 md:pt-8 md:pb-16">
                {children}
              </main>
              <Separator />
              <SiteFooter />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
