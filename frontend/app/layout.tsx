import './globals.css'
import { Inter } from 'next/font/google'
// Import the new horizontal Navbar component
import Navbar from '../components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      {/* 1. Changed 'h-screen' to 'min-h-screen' so it can scroll if content is long.
         2. Changed 'flex' to 'flex flex-col' to stack Navbar on top of Main.
      */}
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning={true}>
        
        {/* The new horizontal navigation bar */}
        <Navbar />

        {/* Main Content - Centered with max-width for a cleaner look */}
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  )
}