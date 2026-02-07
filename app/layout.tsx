import "./globals.css"
import { Poppins } from "next/font/google"
import Header from "./components/Header"
import type React from "react"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // Optimize font loading
})

export const metadata = {
  title: "Idea Submission Portal",
  description: "Submit and review innovative ideas",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${poppins.className} min-h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50`}
      >
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
        <footer className="w-full py-6 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="font-bold text-lg flex flex-wrap items-center justify-center gap-4">
                <p>
                  <span className="font-extrabold">L</span> - Listen
                </p>
                <p>
                  <span className="font-extrabold">E</span> - Engage
                </p>
                <p>
                  <span className="font-extrabold">A</span> - Act
                </p>
                <p>
                  <span className="font-extrabold">P</span> - Progress
                </p>
              </div>
              <div className="text-sm opacity-80">
                © {new Date().getFullYear()} Carelon Global Solutions. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
