import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AtoC · IELTS from Zero',
  description: 'Платформа для подготовки к IELTS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
