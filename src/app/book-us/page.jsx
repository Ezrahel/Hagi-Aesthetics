'use client'
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Script from 'next/script'

export default function BookUsPage() {
    const calendlyContainerRef = useRef(null)
    const initTimeoutRef = useRef(null)
    const [mounted, setMounted] = useState(false)
    const [error, setError] = useState(null)
    const [useFallback, setUseFallback] = useState(false)
    const [scriptReady, setScriptReady] = useState(false)
    
    // Get Calendly URL from environment or use fallback
    const calendlyUrl = useMemo(() => 
        process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/hagiaesthetics/30min',
        []
    )

    // Optimized initialization function
    const initializeWidget = useCallback(() => {
        if (!scriptReady || !calendlyContainerRef.current) {
            return false
        }

        try {
            // Verify container is in DOM
            if (!document.body.contains(calendlyContainerRef.current)) {
                return false
            }

            if (typeof window !== 'undefined' && window.Calendly) {
                window.Calendly.initInlineWidget({
                    url: calendlyUrl,
                    parentElement: calendlyContainerRef.current,
                    prefill: {},
                    utm: {}
                })
                setError(null)
                setUseFallback(false)
                return true
            }
        } catch (initError) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Error initializing Calendly widget:', initError)
            }
        }
        return false
    }, [scriptReady, calendlyUrl])

    // Fast retry with shorter delays
    useEffect(() => {
        if (!mounted || !scriptReady) return

        let retryCount = 0
        const maxRetries = 5 // Reduced from 15
        const initialDelay = 50 // Reduced from 300ms
        const maxDelay = 200 // Cap at 200ms

        const tryInit = () => {
            if (retryCount >= maxRetries) {
                // Fast fallback to iframe if widget doesn't initialize quickly
                setUseFallback(true)
                return
            }

            if (initializeWidget()) {
                // Success!
                return
            }

            retryCount++
            const delay = Math.min(initialDelay * retryCount, maxDelay)
            initTimeoutRef.current = setTimeout(tryInit, delay)
        }

        // Start immediately with minimal delay
        initTimeoutRef.current = setTimeout(tryInit, 10)

        return () => {
            if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current)
            }
        }
    }, [mounted, scriptReady, initializeWidget])

    // Set mounted state immediately
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMounted(true)
        }
    }, [])

    // Handle script load
    const handleScriptLoad = useCallback(() => {
        setScriptReady(true)
    }, [])

    // Handle script error - fast fallback
    const handleScriptError = useCallback(() => {
        setUseFallback(true)
    }, [])

    // Add resource hints for faster loading
    useEffect(() => {
        if (typeof document === 'undefined') return

        // Preconnect to Calendly domains
        const preconnect1 = document.createElement('link')
        preconnect1.rel = 'preconnect'
        preconnect1.href = 'https://assets.calendly.com'
        document.head.appendChild(preconnect1)

        const preconnect2 = document.createElement('link')
        preconnect2.rel = 'preconnect'
        preconnect2.href = 'https://calendly.com'
        document.head.appendChild(preconnect2)

        // DNS prefetch
        const dns1 = document.createElement('link')
        dns1.rel = 'dns-prefetch'
        dns1.href = 'https://assets.calendly.com'
        document.head.appendChild(dns1)

        const dns2 = document.createElement('link')
        dns2.rel = 'dns-prefetch'
        dns2.href = 'https://calendly.com'
        document.head.appendChild(dns2)

        // Preload CSS for faster rendering
        const cssLink = document.createElement('link')
        cssLink.rel = 'stylesheet'
        cssLink.href = 'https://assets.calendly.com/assets/external/widget.css'
        cssLink.onerror = handleScriptError
        document.head.appendChild(cssLink)
    }, [handleScriptError])

    return (
        <>
            {/* Optimized: Use Next.js Script component for better loading */}
            <Script
                src="https://assets.calendly.com/assets/external/widget.js"
                strategy="lazyOnload"
                onLoad={handleScriptLoad}
                onError={handleScriptError}
            />

            {/* Inline styles for immediate rendering */}
            <style dangerouslySetInnerHTML={{__html: `
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
            `}} />

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
                                        href={calendlyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Open in New Tab
                                    </a>
                                </div>
                            </div>
                        ) : useFallback ? (
                            // Fallback: Direct iframe embed (faster, no JS required)
                            <iframe
                                src={calendlyUrl}
                                className="calendly-fallback-iframe w-full"
                                frameBorder="0"
                                title="Calendly Scheduling Page"
                                loading="eager"
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
        </>
    )
}
