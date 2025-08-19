import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MedAtlas',
  description: 'Medical staff scheduling and management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background">
        {children}
      </body>
    </html>
  )
}
