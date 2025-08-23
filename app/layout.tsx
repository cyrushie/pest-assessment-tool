import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { getUser } from "@/lib/auth"
import { AuthNav } from "@/components/auth-nav"
import "./globals.css"

export const metadata: Metadata = {
  title: "Pest Assessment Tool - Professional Pest Identification",
  description:
    "Get professional pest identification and consultation through our comprehensive assessment tool. Track your pest issues and connect with experts.",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()

  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: 'Pest Assessment Tool',
                custom_map: {
                  'custom_parameter_1': 'pest_type',
                  'custom_parameter_2': 'activity_level',
                  'custom_parameter_3': 'confidence_score'
                }
              });
            `,
          }}
        />
      </head>
      <body>
        {children}
        <AuthNav user={user} />
      </body>
    </html>
  )
}
