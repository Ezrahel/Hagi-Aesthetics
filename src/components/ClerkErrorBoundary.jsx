'use client'

import { useEffect } from 'react'

export default function ClerkErrorBoundary({ children }) {
  useEffect(() => {
    const handleError = (error) => {
      console.error('Clerk Error:', error)
      // You can add error reporting here
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return (
    <div className="clerk-error-boundary">
      {children}
    </div>
  )
}
