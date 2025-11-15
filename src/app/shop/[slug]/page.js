'use client'
import Image from 'next/image';
import React, { use as usePromise, useEffect, useMemo, useState } from 'react'
import Banner from '@/components/Banner';
import CTA from '@/components/CTA';
import { loadStripe } from '@stripe/stripe-js';

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

export default function ProductPage({ params }) {
    const { slug } = usePromise(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [qty, setQty] = useState(1)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${slug}`)
                const data = await response.json()
                
                if (response.ok) {
                    setProduct(data.product)
                } else {
                    setError('Product not found')
                }
            } catch (err) {
                setError('Failed to load product')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [slug])

    useEffect(() => {
        try {
            const sp = new URLSearchParams(window.location.search)
            const q = Math.max(1, Math.min(99, Number(sp.get('qty') || 1)))
            setQty(q)
        } catch {}
    }, [])

    const price = product?.price ?? 0
    const total = useMemo(() => (qty * price).toFixed(2), [qty, price])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product...</p>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">{error || 'Product not found'}</p>
                </div>
            </div>
        )
    }

    const decrease = () => setQty(q => Math.max(1, q - 1))
    const increase = () => setQty(q => Math.min(99, q + 1))

    const addToCart = () => {
        try {
            if (typeof window === 'undefined') return
            const key = 'cart'
            const prev = JSON.parse(window.localStorage.getItem(key) || '[]')
            const existingIndex = prev.findIndex((i) => i.id === product.id)
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex].qty = Math.min(99, (updated[existingIndex].qty || 1) + qty)
                window.localStorage.setItem(key, JSON.stringify(updated))
            } else {
                const item = { id: product.id, slug, name: product.name, price, qty, image: product.image }
                window.localStorage.setItem(key, JSON.stringify([...(prev || []), item]))
            }
            window.dispatchEvent(new Event('cart:update'))
            alert('Added to cart')
        } catch (e) {
            console.error('Add to cart failed', e)
        }
    }

    const buyNow = async () => {
        try {
            const stripePromiseInstance = getStripe()
            if (!stripePromiseInstance) {
                throw new Error('Missing Stripe publishable key')
            }
            await stripePromiseInstance
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: qty,
                    metadata: { source: 'product_page', slug }
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
            console.error(e)
            alert('Failed to initialize Stripe checkout. Please try again.')
        }
    }

    return (
        <div className='w-full overflow-hidden'>
            <div className="w-full lg:h-screen relative flex flex-col gap-8 lg:gap-0 lg:flex-row justify-center items-center px-5 lg:px-10 pt-20 lg:pt-14 text-pink">
                <div className='w-full lg:w-1/2 flex flex-col gap-4 lg:items-start relative lg:left-10'>
                    <Image src={product.image} alt="logo" width={1800} height={1800} className='w-full lg:w-[500px] h-auto' />
                    <div className='w-full lg:w-[500px] flex justify-center  gap-4'>
                        <div className='w-[80px] lg:w-[110px] h-[80px] lg:h-[110px] flex justify-center items-center bg-white rounded-lg lg:rounded-xl'>
                            <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[90px] lg:w-[100px] h-auto' />
                        </div>
                        <div className='w-[80px] lg:w-[110px] h-[80px] lg:h-[110px] flex justify-center items-center bg-white rounded-lg lg:rounded-xl'>
                            <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[90px] lg:w-[100px] h-auto' />
                        </div><div className='w-[80px] lg:w-[110px] h-[80px] lg:h-[110px] flex justify-center items-center bg-white rounded-lg lg:rounded-xl'>
                            <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[90px] lg:w-[100px] h-auto' />
                        </div>
                    </div>
                </div>
                <div className='w-full lg:w-1/2 flex flex-col gap-3 lg:gap-6 ' >
                    <p className='font-montserrat font-bold text-[12px] uppercase'>{product.productno}</p>
                    <h3 className='w-full lg:w-[400px] font-astrid text-[36px] lg:text-[56px] leading-10 lg:leading-14'>{product.name}</h3>
                    <div className='font-satoshi text-[24px] leading-5'>★★★★☆</div>
                    <div className='flex gap-2'>
                        <div className='w-[35px] lg:w-[50px] h-[35px] lg:h-[50px] border-4 border-[#B187C6] rounded-full'></div>
                        <div className='w-[35px] lg:w-[50px] h-[35px] lg:h-[50px] border-4 border-[#FCA4A4] rounded-full'></div>
                        <div className='w-[35px] lg:w-[50px] h-[35px] lg:h-[50px] border-4 border-[#FF2F85] rounded-full'></div>
                    </div>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>{product.description}</p>
                    <div>
                        <p className='mb-2 font-montserrat font-bold text-[12px]'>Select Quantity</p>
                        <div className='flex items-center gap-6 lg:gap-10'>
                            <button onClick={decrease} className="w-[40px] lg:w-[56px] h-[40px] lg:h-[56px] border-2 border-pink rounded-tl-full rounded-bl-full flex justify-center items-center text-center font-montserrat font-medium text-[20px] text-black">-</button>
                            <div className='text-black font-montserrat font-medium text-[20px]'>{qty}</div>
                            <button onClick={increase} className="w-[40px] lg:w-[56px] h-[40px] lg:h-[56px] border-2 border-pink rounded-tr-full rounded-br-full flex justify-center items-center text-center font-montserrat font-medium text-[20px] text-black">+</button>
                        </div>
                        <div className='mt-3 font-montserrat font-semibold text-[18px]'>Price: ${price.toFixed(2)} · Total: ${total}</div>
                    </div>
                    <div className='mt-2 flex gap-4 lg:gap-8 font-montserrat font-medium text-[14px] lg:text-[17px]'>
                        <button onClick={addToCart} className='w-full lg:w-[225px] h-[44px] lg:h-[56px] border-2 border-pink rounded-full flex justify-center items-center uppercase'>Add to cart</button>
                        <button onClick={buyNow} className='w-full lg:w-[225px] h-[44px] lg:h-[56px] text-lavender bg-pink border-2 border-pink rounded-full flex justify-center items-center uppercase'>Buy now</button>
                    </div>
                </div>
            </div>

            <div className='-rotate-5'>
                <Banner />
            </div>

            <div className='w-full lg:h-screen flex justify-evenly items-center py-10 lg:py-0'>
                <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[50%] lg:w-[500px] h-auto' />
                <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[50%] lg:w-[500px] h-auto' />
            </div>

            <div className='w-full h-[90vh] lg:h-[75vh] flex flex-col justify-center gap-4 lg:gap-5 text-pink px-5 lg:px-24'>
                <p className='font-montserrat font-bold text-[12px] uppercase'>{product.name}</p>
                <h3 className='w-full lg:w-[500px] font-astrid text-[36px] lg:text-[56px] leading-8 lg:leading-14'>{product.productdetails}</h3>
                <p className='font-satoshi text-[16px] lg:text-[20px]'>{product.description2}</p>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5'>
                    <div className='w-full h-[100px] lg:h-[125px] flex flex-col lg:gap-1 justify-center px-4 lg:px-10 rounded-[16px] lg:rounded-[20px] border-2 border-pink'>
                        <h3 className='font-satoshi font-black text-[14px] lg:text-[16px] uppercase'>Texture</h3>
                        <p className='font-satoshi text-[14px] lg:text-[16px]'>Rich & creamy</p>
                    </div>
                    <div className='w-full h-[100px] lg:h-[125px] flex flex-col lg:gap-1 justify-center px-4 lg:px-10 rounded-[16px] lg:rounded-[20px] border-2 border-pink'>
                        <h3 className='font-satoshi font-black text-[14px] lg:text-[16px] uppercase'>Scent Profile</h3>
                        <p className='font-satoshi text-[14px] lg:text-[16px]'>Calming lavender with a hint of warm vanilla</p>
                    </div>
                    <div className='w-full h-[100px] lg:h-[125px] flex flex-col lg:gap-1 justify-center px-4 lg:px-10 rounded-[16px] lg:rounded-[20px] border-2 border-pink'>
                        <h3 className='font-satoshi font-black text-[14px] lg:text-[16px] uppercase'>Packaging</h3>
                        <p className='font-satoshi text-[14px] lg:text-[16px]'>Sleek, minimal jar with secure lid</p>
                    </div>
                    <div className='w-full h-[100px] lg:h-[125px] flex flex-col lg:gap-1 justify-center px-4 lg:px-10 rounded-[16px] lg:rounded-[20px] border-2 border-pink'>
                        <h3 className='font-satoshi font-black text-[14px] lg:text-[16px] uppercase'>Ideal for</h3>
                        <p className='font-satoshi text-[14px] lg:text-[16px]'>Dry, sensitive, or dull skin</p>
                    </div>
                </div>
            </div>

            <CTA />
        </div>
    )
}
