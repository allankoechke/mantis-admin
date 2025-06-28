import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mantis Admin',
  description: 'Admin dashboard for Mantis BaaS',
  generator: 'mantis.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
