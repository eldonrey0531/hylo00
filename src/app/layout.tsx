import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hylo00',
  description: 'AI-powered travel itinerary generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}