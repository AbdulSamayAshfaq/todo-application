'use client'

import { useAuth } from '../context/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  if (isAuthenticated && user) {
    // Authenticated user header
    return (
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">AI-Powered Todo App</Link>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">Welcome, {user.username}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    )
  } else {
    // Non-authenticated user header
    return (
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/landing" className="text-2xl font-bold text-blue-600">AI-Powered Todo App</Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>
    )
  }
}