'use client'
import React, { useEffect, useRef, useState } from 'react'

export default function BookUsPage() {
    const calendlyContainerRef = useRef(null)
    const scriptLoadedRef = useRef(false)
    const [mounted, setMounted] = useState(false)
    const [error, setError] = useState(null)
    const [useFallback, setUseFallback] = useState(false)
    const [calendlyUrl, setCalendlyUrl] = useState('https://calendly.com/hagiaesthetics/30min')

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return
        }

        setMounted(true)

        // Get Calendly URL from environment or use fallback
        const url = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/hagiaesthetics/30min'
        setCalendlyUrl(url)

        // Debug: Log the URL being used (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.log('Calendly URL:', url)
            console.log('Environment variable set:', !!process.env.NEXT_PUBLIC_CALENDLY_URL)
        }

        // Prevent duplicate script loading
        if (scriptLoadedRef.current) return
        scriptLoadedRef.current = true

        try {
            // Add custom styles for Calendly widget to fill container
            const style = document.createElement('style')
            style.textContent = `
                .calendly-inline-widget {
                    width: 100% !important;
                    height: 100% !important;
                    min-height: 700px !important;
                }
                .calendly-inline-widget iframe {
                    width: 100% !important;
                    height: 100% !important;
                    min-height: 700px !important;
                    border: none !important;
                }
                .calendly-fallback-iframe {
                    width: 100%;
                    height: 700px;
                    min-height: 700px;
                    border: none;
                }
            `
            if (document.head) {
                document.head.appendChild(style)
            }

            // Load Calendly CSS first
            const link = document.createElement('link')
            link.href = 'https://assets.calendly.com/assets/external/widget.css'
            link.rel = 'stylesheet'
            link.onerror = () => {
                // If CSS fails, use fallback iframe
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Calendly CSS failed to load, using fallback iframe')
                }
                setUseFallback(true)
            }
            if (document.head) {
                document.head.appendChild(link)
            }

            // Load Calendly embed script
            const script = document.createElement('script')
            script.src = 'https://assets.calendly.com/assets/external/widget.js'
            script.async = true
            script.onerror = () => {
                // Script failed to load - use fallback iframe
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Calendly script failed to load, using fallback iframe')
                }
                setUseFallback(true)
            }
            script.onload = () => {
                try {
                    // Retry mechanism with increasing delays
                    let retryCount = 0
                    const maxRetries = 15
                    const initialDelay = 300
                    
                    const tryInitialize = () => {
                        if (retryCount >= maxRetries) {
                            // After max retries, fall back to iframe
                            if (process.env.NODE_ENV === 'development') {
                                console.warn('Calendly widget failed to initialize after multiple attempts, using fallback iframe')
                            }
                            setUseFallback(true)
                            return
                        }
                        
                        if (typeof window !== 'undefined' && window.Calendly && calendlyContainerRef.current) {
                            try {
                                // Verify container is in DOM
                                if (!document.body.contains(calendlyContainerRef.current)) {
                                    setTimeout(tryInitialize, initialDelay * (retryCount + 1))
                                    retryCount++
                                    return
                                }
                                
                                window.Calendly.initInlineWidget({
                                    url: url,
                                    parentElement: calendlyContainerRef.current,
                                    prefill: {},
                                    utm: {}
                                })
                                
                                // Success - clear any error state
                                setError(null)
                                setUseFallback(false)
                            } catch (initError) {
                                // Retry on error
                                retryCount++
                                if (retryCount < maxRetries) {
                                    setTimeout(tryInitialize, initialDelay * (retryCount + 1))
                                } else {
                                    // Fall back to iframe
                                    if (process.env.NODE_ENV === 'development') {
                                        console.warn('Error initializing Calendly widget, using fallback:', initError)
                                    }
                                    setUseFallback(true)
                                }
                            }
                        } else {
                            // Calendly not ready or container not mounted - retry
                            retryCount++
                            if (retryCount < maxRetries) {
                                setTimeout(tryInitialize, initialDelay * (retryCount + 1))
                            } else {
                                // Fall back to iframe
                                if (process.env.NODE_ENV === 'development') {
                                    console.warn('Calendly not available or container not ready after retries, using fallback iframe')
                                }
                                setUseFallback(true)
                            }
                        }
                    }
                    
                    // Start initialization with initial delay
                    setTimeout(tryInitialize, initialDelay)
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error in Calendly onload handler:', error)
                    }
                    setUseFallback(true)
                }
            }
            
            if (document.body) {
                document.body.appendChild(script)
            }

            return () => {
                // Cleanup
                try {
                    if (script && script.parentNode) {
                        script.parentNode.removeChild(script)
                    }
                    if (link && link.parentNode) {
                        link.parentNode.removeChild(link)
                    }
                    if (style && style.parentNode) {
                        style.parentNode.removeChild(style)
                    }
                } catch (cleanupError) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error during cleanup:', cleanupError)
                    }
                }
                scriptLoadedRef.current = false
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error setting up Calendly:', error)
            }
            setUseFallback(true)
        }
    }, [])

    return (
        <div className="min-h-screen bg-lavender pt-32 pb-20 px-4 lg:px-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <h1 className="font-astrid text-4xl lg:text-6xl text-pink mb-4">
                            Book Your Consultation
                        </h1>
                        <p className="font-satoshi text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                            Schedule a personalized consultation with our team. Choose a time that works best for you.
                        </p>
                    </div>

                    {/* Calendly Widget Container */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {!mounted ? (
                            <div className="flex items-center justify-center min-h-[700px]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading booking widget...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center min-h-[700px] p-8">
                                <p className="text-red-600 mb-4 text-center">{error}</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-2 bg-pink text-white rounded-lg hover:bg-pink/90 transition-colors"
                                    >
                                        Refresh Page
                                    </button>
                                    <a
                                        href="https://calendly.com/hagiaesthetics/30min"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Open in New Tab
                                    </a>
                                </div>
                            </div>
                        ) : useFallback ? (
                            // Fallback: Direct iframe embed (more reliable, no JS required)
                            <iframe
                                src={calendlyUrl}
                                className="calendly-fallback-iframe w-full"
                                frameBorder="0"
                                title="Calendly Scheduling Page"
                            />
                        ) : (
                            <div 
                                ref={calendlyContainerRef}
                                className="calendly-inline-widget w-full"
                                style={{ 
                                    minHeight: '700px', 
                                    height: '100%',
                                    width: '100%',
                                }}
                            />
                        )}
                    </div>

                    {/* Additional Information */}
                    <div className="mt-10 text-center">
                        <p className="font-satoshi text-sm text-gray-600">
                            Need help? Contact us at{' '}
                            <a 
                                href="mailto:hagiaesthetics@gmail.com" 
                                className="text-pink hover:underline font-semibold"
                            >
                                hagiaesthetics@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
        </div>
    )
}

