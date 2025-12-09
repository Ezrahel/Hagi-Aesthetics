'use client'
import CTA from '@/components/CTA'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { loadStripe } from '@stripe/stripe-js'

let stripePromise
const getStripe = () => {
    if (!stripePromise) {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        if (!publishableKey) {
            return null
        }
        stripePromise = loadStripe(publishableKey)
    }
    return stripePromise
}

const Page = () => {
    const router = useRouter()
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

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
            
            // Check if delivery info exists, if not redirect to delivery-info page
            const deliveryInfo = localStorage.getItem('deliveryInfo')
            if (!deliveryInfo && stored.length > 0) {
                router.push('/delivery-info')
            }
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
            const meta = data?.user?.user_metadata || {}
            const coupons = Array.isArray(meta.coupons) ? meta.coupons : []
            setAvailableCoupons(coupons.filter(c => !c.used))
        }
        load()
        const { data: authListener } = supabase.auth.onAuthStateChange((_evt, session) => {
            const meta = session?.user?.user_metadata || {}
            const coupons = Array.isArray(meta.coupons) ? meta.coupons : []
            setAvailableCoupons(coupons.filter(c => !c.used))
        })
        return () => { authListener?.subscription?.unsubscribe() }
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

    const startStripeCheckout = async () => {
        if (items.length === 0) {
            setError('Your cart is empty.')
            return
        }
        try {
            setProcessing(true)
            setError('')
            const stripePromiseInstance = getStripe()
            if (!stripePromiseInstance) {
                throw new Error('Missing Stripe publishable key')
            }
            await stripePromiseInstance
            
            // Get delivery info from localStorage
            let deliveryInfo = null
            try {
                const saved = localStorage.getItem('deliveryInfo')
                if (saved) {
                    deliveryInfo = JSON.parse(saved)
                }
            } catch (e) {
                console.error('Failed to load delivery info', e)
            }
            
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies in the request
                body: JSON.stringify({
                    items: items.map((item) => ({
                        productId: item.id,
                        quantity: item.qty || 1,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                    })),
                    shipping,
                    discount: perItemDiscount,
                    couponCode: appliedCoupon?.code || null,
                    customerEmail: deliveryInfo?.email || null,
                    customerName: deliveryInfo?.fullName || null,
                    metadata: { 
                        source: 'checkout_page',
                        deliveryInfo: deliveryInfo ? {
                            phone: deliveryInfo.phone,
                            address: deliveryInfo.address,
                            city: deliveryInfo.city,
                            state: deliveryInfo.state,
                            zipCode: deliveryInfo.zipCode
                        } : null
                    }
                })
            })
            if (!response.ok) {
                const detail = await response.json().catch(() => ({}))
                throw new Error(detail?.error || 'Failed to create Stripe checkout session')
            }
            const { url } = await response.json()
            if (!url) {
                throw new Error('Stripe session URL missing in response')
            }
            window.location.href = url
        } catch (e) {
            setError(e.message || 'Unable to start Stripe checkout.')
        } finally {
            setProcessing(false)
        }
    }

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

                    <div className='mt-6'>
                        <button
                            onClick={startStripeCheckout}
                            disabled={processing}
                            className={`w-full bg-pink text-lavender rounded-full py-3 font-montserrat font-bold text-[16px] uppercase transition-colors ${processing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-pink/90'}`}
                        >
                            {processing ? 'Redirecting...' : 'Pay with Stripe'}
                        </button>
                    </div>
                </div>
            </div>
            <CTA />
        </div>
    )
}

export default Page