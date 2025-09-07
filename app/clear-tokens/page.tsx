'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearTokens() {
  const router = useRouter()

  useEffect(() => {
    // Clear all stored tokens
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    })

    // Show message and redirect
    alert('All authentication tokens have been cleared. You will be redirected to login.')
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Clearing tokens and redirecting...</p>
      </div>
    </div>
  )
}
