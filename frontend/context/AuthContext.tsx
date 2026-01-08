'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '../lib/api'

interface AuthContextType {
  user: any | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        const userData = await authApi.getCurrentUser()
        setUser(userData)
      } else {
        setUser(null)
        // If no token, redirect to landing page
        router.push('/landing')
      }
    } catch (error) {
      // User is not authenticated or token is invalid
      localStorage.removeItem('access_token')
      setUser(null)
      // Redirect to landing page when token is invalid
      router.push('/landing')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password)
      localStorage.setItem('access_token', response.access_token)
      // Fetch user data after login
      const userData = await authApi.getCurrentUser()
      setUser(userData)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const signup = async (username: string, email: string, password: string) => {
    try {
      await authApi.signup({ username, email, password })
      // Automatically log in after successful signup
      await login(username, password)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    router.push('/landing')
  }

  const isAuthenticated = !!user

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}