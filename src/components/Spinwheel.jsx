"use client"
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import gsap from "gsap"
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

const Spinwheel = () => {
    const router = useRouter()
    const wheelRef = useRef(null)
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState(null)
    const [user, setUser] = useState(null)
    const [freeSpinsLeft, setFreeSpinsLeft] = useState(3)
    const [paidCreditsCents, setPaidCreditsCents] = useState(0)
    const [showPayModal, setShowPayModal] = useState(false)
    const [loading, setLoading] = useState(false)

    // On return from PayPal, credit $1 and auto start paid spin
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const paymentStatus = params.get('payment')
        if (paymentStatus === 'success') {
            const next = paidCreditsCents + 100
            setPaidCreditsCents(next)
            persistMeta(freeSpinsLeft, next)
            params.delete('payment')
            const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
            window.history.replaceState({}, '', url)
            startSpin('paid')
        }
    }, [])

    // Load session & metadata
    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser()
            const currentUser = data?.user ?? null
            setUser(currentUser)
            if (currentUser) {
                const meta = currentUser.user_metadata || {}
                setFreeSpinsLeft(Number.isFinite(meta.free_spins_left) ? meta.free_spins_left : 3)
                setPaidCreditsCents(Number.isFinite(meta.paid_credits_cents) ? meta.paid_credits_cents : 0)
            }
        }
        init()
        const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
            const nextUser = session?.user ?? null
            setUser(nextUser)
            if (nextUser) {
                const meta = nextUser.user_metadata || {}
                setFreeSpinsLeft(Number.isFinite(meta.free_spins_left) ? meta.free_spins_left : 3)
                setPaidCreditsCents(Number.isFinite(meta.paid_credits_cents) ? meta.paid_credits_cents : 0)
            } else {
                setFreeSpinsLeft(3)
                setPaidCreditsCents(0)
            }
        })
        return () => {
            sub.subscription.unsubscribe()
        }
    }, [])

    const persistMeta = async (nextFreeSpinsLeft, nextPaidCreditsCents) => {
        await supabase.auth.updateUser({
            data: {
                free_spins_left: nextFreeSpinsLeft,
                paid_credits_cents: nextPaidCreditsCents
            }
        })
    }

    const startSpin = (spendType /* 'free' | 'paid' */) => {
        setSpinning(true)
        setResult(null)

        const extraSpins = 3
        const randomDeg = Math.floor(Math.random() * 360)
        const finalRotation = extraSpins * 360 + randomDeg

        gsap.set(wheelRef.current, { rotation: 0 })

        gsap.to(wheelRef.current, {
            rotation: finalRotation,
            duration: 6,
            ease: "power4.out",
            onComplete: async () => {
                gsap.set(wheelRef.current, { rotation: randomDeg })
                setSpinning(false)

                // Deduct balances and persist
                if (spendType === 'free') {
                    const next = Math.max(freeSpinsLeft - 1, 0)
                    setFreeSpinsLeft(next)
                    await persistMeta(next, paidCreditsCents)
                } else if (spendType === 'paid') {
                    const next = Math.max(paidCreditsCents - 100, 0)
                    setPaidCreditsCents(next)
                    await persistMeta(freeSpinsLeft, next)
                }

                // Very low win rate (5%)
                const didWin = Math.random() < 0.05
                if (didWin) {
                    const amount = 5
                    const couponCode = `HAGI-5OFF-${Math.floor(Math.random() * 100000)}`

                    // Persist coupon into user metadata list
                    try {
                        const currentMeta = user?.user_metadata || {}
                        const existing = Array.isArray(currentMeta.coupons) ? currentMeta.coupons : []
                        const nextCoupons = [
                            ...existing,
                            { code: couponCode, amount, type: 'per_item', amountPerItem: 5, used: false, createdAt: new Date().toISOString() }
                        ]
                        await supabase.auth.updateUser({ data: { coupons: nextCoupons } })
                    } catch (e) {
                        console.error('Failed to persist coupon', e)
                    }

                    setResult({ status: "win", amount, code: couponCode })
                } else {
                    setResult({ status: "lose" })
                }
            }
        })
    }

    const startPaypalCheckout = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/paypal/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: '1.00' }) })
            if (!res.ok) {
                const text = await res.text().catch(() => '')
                console.error('PayPal create error', res.status, text)
                throw new Error('Failed to create PayPal order')
            }
            const { approvalUrl } = await res.json()
            window.location.href = approvalUrl
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSpin = () => {
        if (spinning) return
        if (!user) {
            router.push('/sign-in')
            return
        }
        if (freeSpinsLeft > 0) {
            startSpin('free')
            return
        }
        if (paidCreditsCents >= 100) {
            startSpin('paid')
            return
        }
        // No credits: redirect to PayPal checkout
        startPaypalCheckout()
    }

    return (
        <div className='w-full flex flex-col gap-4 lg:gap-0 lg:flex-row h-full lg:h-[100dvh] px-5 lg:px-0 py-4 mb-10 lg:mb-20'>
            <div className='w-full lg:w-1/2 h-full lg:h-full flex justify-center items-center'>
                <div className='flex flex-col gap-4 justify-center items-center'>
                    <Image src="/playtowin.png" alt="bg" width={1000} height={1000} className='w-[75%] lg:w-[700px] h-auto object-cover' />
                    <h3 className='w-full lg:w-[600px] text-center font-satoshi text-[14px] lg:text-[18px]'>
                        SPIN TO WIN! Get 3 FREE opportunities to spin the wheel & receive $5-$10 OFF your TOTAL purchase at checkout. YOU LOVE THE THRILL ? If you love to win, PLAY 0TO HAGI WIN!!❤️
                    </h3>
                    {user && (
                        <div className="text-sm text-gray-700">
                            Free spins left: <span className="font-semibold">{freeSpinsLeft}</span> · Balance: <span className="font-semibold">${(paidCreditsCents/100).toFixed(2)}</span>
                        </div>
                    )}
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
                    <button
                        onClick={handleSpin}
                        disabled={spinning}
                        className={`font-astrid text-[16px] lg:text-[20px] text-black bg-pink shadow-lg shadow-white rounded-full px-4 lg:px-10 py-2 lg:py-3 cursor-pointer hover:scale-105 transition ${spinning ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {spinning ? "Spinning..." : "Spin Wheel"}
                    </button>
                    {!user && (
                        <p className="text-sm text-gray-600">Please sign in to spin.</p>
                    )}
                </div>

                {result && (
                    <div className="h-full flex justify-center items-center absolute top-1/3 -translate-y-1/2   lg:top-2/4  text-center  font-satoshi px-8 lg:px-0">
                        {result.status === "win" ? (
                            <div>
                                <h2 className='font-astrid text-pink font-bold  text-[32px] lg:text-[52px] '>You’ve won!</h2>
                                <div className="relative inline-block">
                                    <div className="px-6 lg:px-14 py-2 lg:py-5 bg-pink rounded-[6px] shadow-xl">
                                    <h2 className="text-md lg:text-xl font-bold text-lavender">
                                        Congratulations! You won ${result.amount} off
                                    </h2>
                                    <p className="mt-2 text-sm lg:text-base text-lavender">
                                        Use this coupon at checkout:
                                    </p>
                                        <p className="font-mono text-md text-pink lg:text-xl mt-3 bg-lavender px-3 py-1 rounded inline-block">
                                        {result.code}
                                    </p>
                                        <p className="mt-2 text-xs text-lavender/80">Copy and apply on the checkout page.</p>
                                    </div>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                        <span className="inline-block bg-pink text-lavender px-4 py-1 rounded-full text-sm shadow">
                                            🎉 Winner 🎀
                                        </span>
                                    </div>
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
