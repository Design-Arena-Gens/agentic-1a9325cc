import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Particle Playground',
  description: 'Interactive particle system with customizable effects',
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
