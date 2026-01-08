import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../context/AuthContext'
import Header from './header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI-Powered Todo App',
  description: 'A smart todo application with AI capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto p-4 max-w-6xl">
              {children}
            </main>
            <footer className="bg-gray-800 text-white p-6 mt-12">
              <div className="container mx-auto text-center">
                <p>© {new Date().getFullYear()} AI-Powered Todo App. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}