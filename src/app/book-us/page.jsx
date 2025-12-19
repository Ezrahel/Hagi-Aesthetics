'use client'
import React, { useEffect, useRef } from 'react'

export default function BookUsPage() {
    const calendlyContainerRef = useRef(null)
    const scriptLoadedRef = useRef(false)

    useEffect(() => {
        // Prevent duplicate script loading
        if (scriptLoadedRef.current) return
        scriptLoadedRef.current = true

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
        document.head.appendChild(style)

        // Load Calendly CSS first
        const link = document.createElement('link')
        link.href = 'https://assets.calendly.com/assets/external/widget.css'
        link.rel = 'stylesheet'
        document.head.appendChild(link)

        // Load Calendly embed script
        const script = document.createElement('script')
        script.src = 'https://assets.calendly.com/assets/external/widget.js'
        script.async = true
        script.onload = () => {
            // Initialize Calendly inline widget after script loads
            if (window.Calendly && calendlyContainerRef.current) {
                const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/hagiaesthetics/30min'
                
                window.Calendly.initInlineWidget({
                    url: calendlyUrl,
                    parentElement: calendlyContainerRef.current,
                    prefill: {},
                    utm: {}
                })
            }
        }
        document.body.appendChild(script)

        return () => {
            // Cleanup
            if (script.parentNode) {
                script.parentNode.removeChild(script)
            }
            if (link.parentNode) {
                link.parentNode.removeChild(link)
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style)
            }
            scriptLoadedRef.current = false
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
                        <div 
                            ref={calendlyContainerRef}
                            className="calendly-inline-widget w-full"
                            style={{ 
                                minHeight: '700px', 
                                height: '100%',
                                width: '100%',
                            }}
                        />
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

