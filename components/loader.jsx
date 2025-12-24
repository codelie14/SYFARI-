'use client'

import { useEffect, useState } from 'react'

export default function Loader({ size = 12, text = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`relative h-${size} w-${size}`}>
        <svg
          className="animate-spin h-12 w-12 text-orange-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>
      {text && <p className="mt-4 text-gray-600 text-sm font-medium animate-pulse">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <Loader text="Veuillez patienter..." />
      </div>
    </div>
  )
}
