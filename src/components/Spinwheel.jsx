"use client"
import Image from 'next/image'
import React, { useRef, useState } from 'react'
import gsap from "gsap"

const Spinwheel = () => {
    const wheelRef = useRef(null)
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState(null)
    const [spinsLeft, setSpinsLeft] = useState(3)
    const [paidSpins, setPaidSpins] = useState(0)

    const handleSpin = (force = false) => {
        if (spinning) return
        if (!force && spinsLeft <= 0 && paidSpins <= 0) return

        setSpinning(true)
        setResult(null)

        const extraSpins = 2
        const randomDeg = Math.floor(Math.random() * 360)
        const finalRotation = extraSpins * 360 + randomDeg

        gsap.set(wheelRef.current, { rotation: 0 })

        gsap.to(wheelRef.current, {
            rotation: finalRotation,
            duration: 6,
            ease: "power4.out",
            onComplete: () => {
                gsap.set(wheelRef.current, { rotation: randomDeg })
                setSpinning(false)

                if (spinsLeft > 0) {
                    setSpinsLeft(prev => prev - 1)
                } else if (paidSpins > 0 || force) {
                    setPaidSpins(prev => Math.max(prev - 1, 0))
                }

                const didWin = Math.random() > 0.4
                if (didWin) {
                    const amount = Math.floor(Math.random() * 10) + 1
                    const couponCode = `HAGI-${amount}OFF-${Math.floor(Math.random() * 1000)}`
                    setResult({
                        status: "win",
                        amount,
                        code: couponCode
                    })
                } else {
                    setResult({
                        status: "lose"
                    })
                }
            }
        })
    }

    const handlePayAndSpin = () => {
        setPaidSpins(1)
        handleSpin(true)
    }

    return (
        <div className='w-full flex flex-col gap-4 lg:gap-0 lg:flex-row h-full lg:h-[100dvh] px-5 lg:px-0 py-4 mb-10 lg:mb-20'>
            <div className='w-full lg:w-1/2 h-full lg:h-full flex justify-center items-center'>
                <div className='flex flex-col gap-4 justify-center items-center'>
                    <Image src="/playtowin.png" alt="bg" width={1000} height={1000} className='w-[75%] lg:w-[700px] h-auto object-cover' />
                    <h3 className='w-full lg:w-[600px] text-center font-satoshi text-[14px] lg:text-[18px]'>
                        SPIN TO WIN! Get 3 FREE opportunities to spin the wheel & receive $5-$10 OFF your TOTAL purchase at checkout. YOU LOVE THE THRILL ? If you love to win, PLAY TO HAGI WIN!!❤️
                    </h3>
                </div>
            </div>

            <div className='w-full lg:w-1/2 h-full lg:h-full flex flex-col gap-3 lg:gap-6 justify-center items-center overflow-hidden relative'>
                <div className={`${result ? "opacity-25" : "opacity-100"}  flex flex-col justify-center items-center overflow-hidden`}>
                    <Image
                        ref={wheelRef}
                        src="/spinwheel1.png"
                        alt="spinwheel"
                        width={1000}
                        height={1000}
                        className="w-full h-full object-contain border"
                    />
                </div>

                <div className="flex flex-col items-center gap-2 pointer-events-auto relative z-10">
                    {spinsLeft > 0 ? (
                        <button
                            onClick={handleSpin}
                            disabled={spinning}
                            className={`font-astrid text-[16px] lg:text-[20px] text-black bg-pink shadow-lg shadow-white rounded-full px-4 lg:px-10 py-2 lg:py-3 cursor-pointer
                ${spinning ? "opacity-50 cursor-not-allowed" : "hover:scale-105 transition"}`}
                        >
                            {spinning ? "Spinning..." : `Free Spin (${spinsLeft} left)`}
                        </button>
                    ) : (
                        <button
                            onClick={handlePayAndSpin}
                            disabled={spinning}
                            className={`font-astrid text-[16px] lg:text-[20px] text-black bg-pink shadow-lg shadow-white rounded-full px-4 lg:px-10 py-2 lg:py-3  cursor-pointer
              ${spinning ? "opacity-50 cursor-not-allowed" : "hover:scale-105 transition"}`}
                        >
                            {spinning ? "Processing..." : "Pay $1 to Spin"}
                        </button>
                    )}

                </div>

                {result && (
                    <div className="h-full flex justify-center items-center absolute top-1/3 -translate-y-1/2   lg:top-2/4  text-center  font-satoshi px-8 lg:px-0">
                        {result.status === "win" ? (
                            <div>
                                <h2 className='font-astrid text-pink font-bold  text-[32px] lg:text-[52px] '>You’ve won!</h2>
                                <div className="px-6 lg:px-14 py-2 lg:py-5 bg-pink rounded-[6px]">
                                    <h2 className="text-md lg:text-xl font-bold text-lavender">
                                        Congratulations! You won ${result.amount} off
                                    </h2>
                                    <p className="mt-2 text-sm lg:text-base text-lavender">
                                        Use this coupon at checkout:
                                    </p>
                                    <p className="font-mono text-md text-pink lg:text-xl mt-3 bg-lavender px-3 py-1 rounded  inline-block">
                                        {result.code}
                                    </p>
                                </div>
                            </div>

                        ) : (
                            <div className="p-4  rounded-lg">
                                <h2 className="font-astrid text-pink font-bold  text-[18px] lg:text-[52px] ">
                                    Try Again
                                </h2>
                            </div>
                        )}
                    </div>
                )
                }
            </div >
        </div >
    )
}

export default Spinwheel
