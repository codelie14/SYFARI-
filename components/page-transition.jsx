'use client'

import { useEffect, useState } from 'react'

export default function PageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Handle route changes by listening to visibility and document changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTransitioning(true)
      }
    }

    // Monitor for page load completion
    const handlePageLoad = () => {
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('load', handlePageLoad)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('load', handlePageLoad)
    }
  }, [])

  if (!isTransitioning) return null

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-10 w-10 text-orange-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <p className="text-gray-600 text-sm font-medium">Chargement...</p>
      </div>
    </div>
  )
}
