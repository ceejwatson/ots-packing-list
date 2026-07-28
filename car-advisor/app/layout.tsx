import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Should I buy this car?',
  description:
    'Paste any car listing. Know if it is a good deal in 10 seconds — real market value, reliability, five-year cost, and what to offer.',
  openGraph: {
    title: 'Paste any car listing. Know if it is a good deal in 10 seconds.',
    description:
      'Market value, reliability, five-year cost of ownership, hidden red flags, and exactly what to offer.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1113' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
