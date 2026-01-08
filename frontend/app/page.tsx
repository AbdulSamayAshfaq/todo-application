'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/landing')
      }
    }
  }, [loading, isAuthenticated, router])

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading AI-Powered Todo App...</p>
      </div>
    </div>
  )
}