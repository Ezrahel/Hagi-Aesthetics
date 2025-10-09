'use client'
import CTA from '@/components/CTA'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

const page = () => {
    const [sdkReady, setSdkReady] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState('')

    const [user, setUser] = useState(null)
    const [availableCoupons, setAvailableCoupons] = useState([])
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)

    const [items, setItems] = useState([])

    // Load cart from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const stored = JSON.parse(window.localStorage.getItem('cart') || '[]')
            setItems(Array.isArray(stored) ? stored : [])
        } catch {
            setItems([])
        }
    }, [])

    const subtotal = useMemo(() => items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0), [items])
    const shipping = 4.99

    // Per-item $5 discount when coupon applied
    const perItemDiscount = useMemo(() => {
        if (!appliedCoupon) return 0
        const count = items.reduce((n, i) => n + (i.qty || 1), 0)
        const discount = 5 * count
        return Math.min(discount, subtotal)
    }, [appliedCoupon, items, subtotal])

    const total = useMemo(() => {
        const t = subtotal - perItemDiscount + shipping
        return (t < 0 ? 0 : t).toFixed(2)
    }, [subtotal, perItemDiscount])

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.auth.getUser()
            const u = data?.user ?? null
            setUser(u)
            const meta = u?.user_metadata || {}
            const coupons = Array.isArray(meta.coupons) ? meta.coupons : []
            setAvailableCoupons(coupons.filter(c => !c.used))
        }
        load()
        const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
            const u = session?.user ?? null
            setUser(u)
            const meta = u?.user_metadata || {}
            const coupons = Array.isArray(meta.coupons) ? meta.coupons : []
            setAvailableCoupons(coupons.filter(c => !c.used))
        })
        return () => { sub.subscription.unsubscribe() }
    }, [])

    const applyCoupon = () => {
        setError('')
        if (!couponCode) return
        const c = availableCoupons.find(c => c.code.trim().toUpperCase() === couponCode.trim().toUpperCase())
        if (!c) {
            setError('Invalid or already used coupon code.')
            setAppliedCoupon(null)
            return
        }
        // Force to per-item $5 usage
        setAppliedCoupon({ ...c, type: 'per_item', amountPerItem: 5 })
    }

    useEffect(() => {
        if (!PAYPAL_CLIENT_ID) return
        if (document.getElementById('paypal-sdk')) {
            setSdkReady(true)
            return
        }
        const script = document.createElement('script')
        script.id = 'paypal-sdk'
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`
        script.async = true
        script.onload = () => setSdkReady(true)
        document.body.appendChild(script)
    }, [])

    useEffect(() => {
        if (!sdkReady) return
        if (!(window).paypal) return
        setError('')
        ;(window).paypal.Buttons({
            style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
            createOrder: (_data, actions) => {
                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                currency_code: 'USD',
                                value: total,
                                breakdown: {
                                    item_total: { currency_code: 'USD', value: subtotal.toFixed(2) },
                                    shipping: { currency_code: 'USD', value: shipping.toFixed(2) },
                                    discount: { currency_code: 'USD', value: perItemDiscount.toFixed(2) },
                                }
                            },
                            items: items.map(i => ({
                                name: i.name,
                                quantity: String(i.qty || 1),
                                unit_amount: { currency_code: 'USD', value: (i.price || 0).toFixed(2) }
                            }))
                        }
                    ]
                })
            },
            onApprove: async (_data, actions) => {
                setProcessing(true)
                try {
                    const details = await actions.order.capture()
                    setSuccess({ id: details.id, status: details.status })
                    // Mark coupon as used once an order succeeds
                    if (appliedCoupon && user) {
                        try {
                            const meta = user.user_metadata || {}
                            const coupons = Array.isArray(meta.coupons) ? meta.coupons : []
                            const updated = coupons.map(c => c.code === appliedCoupon.code ? { ...c, used: true, usedAt: new Date().toISOString() } : c)
                            await supabase.auth.updateUser({ data: { coupons: updated } })
                            setAvailableCoupons(updated.filter(c => !c.used))
                        } catch (e) {
                            console.error('Failed to mark coupon used', e)
                        }
                    }
                    // Create order record
                    try {
                        await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                paypalOrderId: details.id,
                                status: details.status,
                                items,
                                subtotal,
                                shipping,
                                discount: perItemDiscount,
                                total: Number(total),
                                couponCode: appliedCoupon?.code || null,
                                customerEmail: null,
                                customerName: null,
                                paypalCapture: details,
                            })
                        })
                    } catch (e) {
                        console.error('Failed to record order', e)
                    }
                } catch (e) {
                    setError('Payment capture failed. Please try again.')
                } finally {
                    setProcessing(false)
                }
            },
            onError: (err) => {
                console.error(err)
                setError('Payment failed to initialize. Please try again.')
            },
            onCancel: () => {
                setError('Payment was canceled.')
            }
        }).render('#paypal-checkout-container')
        return () => {
            const c = document.getElementById('paypal-checkout-container')
            if (c) c.innerHTML = ''
        }
    }, [sdkReady, subtotal, shipping, total, perItemDiscount, items, appliedCoupon, user])

    return (
        <div className='pt-20'>
            <div className='w-full flex flex-col lg:flex-row justify-between py-14 px-8 lg:px-24 gap-10'>
                <div className='w-full lg:w-[60%]'>
                    <h2 className='font-astrid text-[22px] lg:text-[24px] mb-4'>Apply Coupon</h2>
                    <div className='flex gap-3 items-center'>
                        <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder='Enter coupon code' className='w-full lg:w-[400px] h-[52px] border border-[#00000050] font-satoshi italic text-[14px] px-4 outline-none' />
                        <button onClick={applyCoupon} className='px-5 py-3 bg-pink text-lavender rounded font-satoshi'>Apply</button>
                    </div>
                    {appliedCoupon && (
                        <p className='mt-2 text-sm text-green-700'>Applied coupon {appliedCoupon.code}: $5 off per item.</p>
                    )}
                    {error && (
                        <p className='mt-2 text-sm text-red-600'>{error}</p>
                    )}

                    <div className='mt-8'>
                        <h3 className='font-astrid text-[22px] lg:text-[24px] mb-3'>Cart</h3>
                        <div className='space-y-2'>
                            {items.length === 0 && (
                                <p className='text-sm text-gray-600'>Your cart is empty.</p>
                            )}
                            {items.map((i) => (
                                <div key={i.slug} className='flex justify-between items-center border-b border-[#00000020] py-3'>
                                    <div className='flex items-center gap-3'>
                                        <Image src={i.image} alt={i.name} width={56} height={56} className='w-14 h-14 object-cover rounded' />
                                        <div>
                                            <p className='font-satoshi text-[14px]'>{i.name}</p>
                                            <p className='text-xs text-gray-600'>${(i.price || 0).toFixed(2)} × {i.qty || 1}</p>
                                        </div>
                                    </div>
                                    <div className='font-satoshi font-semibold'>${(((i.price || 0) * (i.qty || 1))).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='w-full lg:w-[40%]'>
                    <h2 className='font-astrid text-[22px] lg:text-[24px] mb-4'>Order Summary</h2>
                    <div className='space-y-2 lg:space-y-4 font-satoshi font-bold text-[14px]'>
                        <div className='w-full flex py-3 border-b border-[#00000050]'>
                            <p className='w-[50%]'>Cart Subtotal</p>
                            <p className='w-[50%]'>${subtotal.toFixed(2)}</p>
                        </div>
                        <div className='w-full flex py-3 border-b border-[#00000050]'>
                            <p className='w-[50%]'>Discount</p>
                            <p className='w-[50%]'>-${perItemDiscount.toFixed(2)}</p>
                        </div>
                        <div className='w-full flex py-3 border-b border-[#00000050]'>
                            <p className='w-[50%]'>Shipping</p>
                            <p className='w-[50%]'>${shipping.toFixed(2)}</p>
                        </div>
                        <div className='w-full flex justify-evenly py-3 border-b border-[#00000050]'>
                            <p className='w-[50%]'>Order Total</p>
                            <p className='w-[50%]'>${total}</p>
                        </div>
                    </div>

                    <div id='paypal-checkout-container' className='mt-6'></div>
                    
                    <div className='mt-6'>
                        <button 
                            onClick={() => window.location.href = `/api/paypal/create?amount=${total}`}
                            className='w-full bg-pink text-lavender rounded-full py-3 font-montserrat font-bold text-[16px] uppercase hover:bg-pink/90 transition-colors'
                        >
                            Pay with PayPal
                        </button>
                    </div>
                </div>
            </div>
            <CTA />
        </div>
    )
}

export default page