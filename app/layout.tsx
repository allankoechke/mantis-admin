import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mantis Admin Dashboard',
  description: 'Dashboard interface for Mantis BaaS library.',
  generator: 'v0.dev',
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
