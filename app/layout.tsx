import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Postmodern Jukebox Events',
  description: 'Upcoming concerts and shows for Postmodern Jukebox',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

