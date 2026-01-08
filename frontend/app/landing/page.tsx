'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Your Tasks Smarter with AI
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Experience the future of task management with our AI-powered todo application.
            Organize, prioritize, and complete your tasks more efficiently than ever before.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Get Started
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-blue-600 text-3xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">
                Get intelligent suggestions and insights to help prioritize your tasks.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-blue-600 text-3xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">Smart Organization</h3>
              <p className="text-gray-600">
                Automatically categorize and organize tasks based on priority and deadlines.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-blue-600 text-3xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">Seamless Experience</h3>
              <p className="text-gray-600">
                Clean, intuitive interface designed to boost your productivity.
              </p>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}