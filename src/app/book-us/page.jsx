'use client'
import React, { useEffect, useRef, useState } from 'react'

export default function BookUsPage() {
    const calendlyContainerRef = useRef(null)
    const scriptLoadedRef = useRef(false)
    const [mounted, setMounted] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return
        }

        setMounted(true)

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
            `
            if (document.head) {
                document.head.appendChild(style)
            }

            // Load Calendly CSS first
            const link = document.createElement('link')
            link.href = 'https://assets.calendly.com/assets/external/widget.css'
            link.rel = 'stylesheet'
            if (document.head) {
                document.head.appendChild(link)
            }

            // Load Calendly embed script
            const script = document.createElement('script')
            script.src = 'https://assets.calendly.com/assets/external/widget.js'
            script.async = true
            script.onerror = () => {
                console.error('Failed to load Calendly script')
                setError('Failed to load booking widget. Please refresh the page.')
            }
            script.onload = () => {
                try {
                    // Wait a bit for Calendly to fully initialize
                    setTimeout(() => {
                        if (typeof window !== 'undefined' && window.Calendly && calendlyContainerRef.current) {
                            const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/hagiaesthetics/30min'
                            
                            try {
                                window.Calendly.initInlineWidget({
                                    url: calendlyUrl,
                                    parentElement: calendlyContainerRef.current,
                                    prefill: {},
                                    utm: {}
                                })
                            } catch (initError) {
                                console.error('Error initializing Calendly widget:', initError)
                                setError('Failed to initialize booking widget. Please refresh the page.')
                            }
                        } else {
                            // Only log in development
                            if (process.env.NODE_ENV === 'development') {
                                console.warn('Calendly not available or container not ready')
                            }
                        }
                    }, 100)
                } catch (error) {
                    console.error('Error in Calendly onload handler:', error)
                    setError('Failed to load booking widget. Please refresh the page.')
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
                    console.error('Error during cleanup:', cleanupError)
                }
                scriptLoadedRef.current = false
            }
        } catch (error) {
            console.error('Error setting up Calendly:', error)
            setError('Failed to load booking widget. Please refresh the page.')
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
                                <p className="text-gray-500">Loading booking widget...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center min-h-[700px] p-8">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-pink text-white rounded-lg hover:bg-pink/90 transition-colors"
                                >
                                    Refresh Page
                                </button>
                            </div>
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

