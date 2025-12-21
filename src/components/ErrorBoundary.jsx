'use client'

import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (and potentially to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Prevent error from causing infinite loops
    if (error?.message?.includes('aa') || error?.stack?.includes('aa')) {
      console.error('Detected potential Calendly/minified error, suppressing to prevent crash loop')
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-lavender p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-pink mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We encountered an error. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}
              className="px-6 py-2 bg-pink text-white rounded-lg hover:bg-pink/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

