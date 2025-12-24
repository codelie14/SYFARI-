'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loader from './loader'

export default function ProtectedLayout({ children }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  if (!isAuthenticated) {
    return <Loader text="Redirection..." />
  }

  return <>{children}</>
}
