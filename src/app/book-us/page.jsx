'use client'
import React, { useEffect, useState } from 'react'

export default function BookUsPage() {
    const [mounted, setMounted] = useState(false)
    const [iframeError, setIframeError] = useState(false)
    
    // Zcal booking URL
    const zcalUrl = 'https://zcal.co/hagiaesthetics'

    // Set mounted state immediately
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMounted(true)
        }
    }, [])

    // Handle iframe load error
    const handleIframeError = () => {
        setIframeError(true)
    }

    return (
        <>
            {/* Inline styles for Zcal iframe */}
            <style dangerouslySetInnerHTML={{__html: `
                .zcal-iframe {
                    width: 100%;
                    height: 100%;
                    min-height: 700px;
                    border: none;
                }
            `}} />

            <div className="min-h-screen bg-lavender pt-32 pb-20 px-4 lg:px-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <h1 className="font-astrid text-4xl lg:text-6xl text-pink mb-4">
                            Book Appointment
                        </h1>
                        <p className="font-satoshi text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                        Reserve a one-on-one facial appointment tailored to your skin&apos;s unique needs. Select a time that works best for you.
                        </p>
                    </div>

                    {/* Services Cards Section */}
                    <div className="mb-10">
                        <h2 className="font-astrid text-2xl lg:text-3xl text-pink mb-6 text-center">
                            Different Services
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                            {/* Express Facial Card */}
                            <div className="bg-[#F5E0FF] border-2 border-pink rounded-[16px] lg:rounded-[20px] p-5 lg:p-6 flex flex-col">
                                <h3 className="font-satoshi font-black text-[16px] lg:text-[18px] uppercase text-pink mb-2">
                                    Express Facial
                                </h3>
                                <p className="font-satoshi font-semibold text-[14px] lg:text-[16px] text-pink mb-3">
                                    Time: 25 minutes
                                </p>
                                <p className="font-satoshi text-[14px] lg:text-[15px] text-gray-700 leading-relaxed">
                                    Perfect for clients who want glowing skin. This quick treatment includes a deep cleanse, gentle exfoliation, and customized finishing products to instantly refresh and hydrate the skin. Ideal for maintenance in between full facials or before an event.
                                </p>
                            </div>

                            {/* Signature / Basic Facial Card */}
                            <div className="bg-[#F5E0FF] border-2 border-pink rounded-[16px] lg:rounded-[20px] p-5 lg:p-6 flex flex-col">
                                <h3 className="font-satoshi font-black text-[16px] lg:text-[18px] uppercase text-pink mb-2">
                                    Signature / Basic Facial
                                </h3>
                                <p className="font-satoshi font-semibold text-[14px] lg:text-[16px] text-pink mb-3">
                                    Time: 60 minutes
                                </p>
                                <p className="font-satoshi text-[14px] lg:text-[15px] text-gray-700 leading-relaxed">
                                    This is your go-to, fully customized facial designed to deeply cleanse, exfoliate, and nourish the skin. Includes cleansing, exfoliation, extractions (if needed), mask, facial massage, and targeted serums and moisturizers tailored to your skin type. Leaves the skin balanced, radiant, and refreshed.
                                </p>
                            </div>

                            {/* Corrective Facial Card */}
                            <div className="bg-[#F5E0FF] border-2 border-pink rounded-[16px] lg:rounded-[20px] p-5 lg:p-6 flex flex-col">
                                <h3 className="font-satoshi font-black text-[16px] lg:text-[18px] uppercase text-pink mb-2">
                                    Corrective Facial
                                </h3>
                                <p className="font-satoshi font-semibold text-[14px] lg:text-[16px] text-pink mb-3">
                                    Time: 60 minutes
                                </p>
                                <p className="font-satoshi text-[14px] lg:text-[15px] text-gray-700 leading-relaxed">
                                    A results-driven facial focused on correcting specific skin concerns such as acne, hyperpigmentation, uneven texture, congestion, or dullness. This advanced treatment may include deeper exfoliation, extended extractions, targeted treatments, masks, and corrective serums to improve overall skin health and clarity.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Zcal Widget Container */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {!mounted ? (
                            <div className="flex items-center justify-center min-h-[700px]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading booking widget...</p>
                                </div>
                            </div>
                        ) : iframeError ? (
                            <div className="flex flex-col items-center justify-center min-h-[700px] p-8">
                                <p className="text-red-600 mb-4 text-center">Unable to load booking widget. Please try again.</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setIframeError(false)
                                            window.location.reload()
                                        }}
                                        className="px-6 py-2 bg-pink text-white rounded-lg hover:bg-pink/90 transition-colors"
                                    >
                                        Refresh Page
                                    </button>
                                    <a
                                        href={zcalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Open in New Tab
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <iframe
                                src={zcalUrl}
                                className="zcal-iframe w-full"
                                frameBorder="0"
                                title="Zcal Scheduling Page"
                                loading="lazy"
                                onError={handleIframeError}
                                allow="camera; microphone; geolocation"
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
