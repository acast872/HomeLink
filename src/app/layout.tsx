import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HomeLink',
  description: 'Home service platform connecting customers and servicers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
