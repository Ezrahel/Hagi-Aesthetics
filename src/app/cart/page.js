'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import CTA from '@/components/CTA'

const Page = () => {
    const [items, setItems] = useState([])

    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const stored = JSON.parse(window.localStorage.getItem('cart') || '[]')
            setItems(Array.isArray(stored) ? stored : [])
        } catch { setItems([]) }
    }, [])

    const updateStorage = (next) => {
        setItems(next)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('cart', JSON.stringify(next))
            window.dispatchEvent(new Event('cart:update'))
        }
    }

    const increase = (slug) => {
        const next = items.map(i => i.slug === slug ? { ...i, qty: Math.min(99, (i.qty || 1) + 1) } : i)
        updateStorage(next)
    }
    const decrease = (slug) => {
        const next = items.map(i => i.slug === slug ? { ...i, qty: Math.max(1, (i.qty || 1) - 1) } : i)
        updateStorage(next)
    }
    const remove = (slug) => {
        const next = items.filter(i => i.slug !== slug)
        updateStorage(next)
    }

    const subtotal = useMemo(() => items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0), [items])

    return (
        <div className='px-5 lg:px-24 py-10 text-pink'>
            <div className='text-center lg:text-left mb-6'>
                <h3 className='font-astrid text-[28px] lg:text-[36px]'>Your Cart</h3>
                <p className='font-satoshi text-[14px] lg:text-[16px]'>Review your items and proceed to checkout.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                <div className='lg:col-span-2'>
                    {items.length === 0 ? (
                        <p className='text-sm text-gray-600'>Your cart is empty.</p>
                    ) : (
                        <div className='space-y-4'>
                            {items.map(i => (
                                <div key={i.slug} className='flex items-center justify-between border-b border-[#00000020] py-3 gap-3'>
                                    <div className='flex items-center gap-3'>
                                        <Image src={i.image} alt={i.name} width={56} height={56} className='w-14 h-14 object-cover rounded' />
                                        <div>
                                            <p className='font-satoshi text-[14px]'>{i.name}</p>
                                            <p className='text-xs text-gray-600'>${(i.price || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <button onClick={() => decrease(i.slug)} className='w-[28px] h-[28px] border border-pink rounded-full'>-</button>
                                        <span className='w-8 text-center'>{i.qty || 1}</span>
                                        <button onClick={() => increase(i.slug)} className='w-[28px] h-[28px] border border-pink rounded-full'>+</button>
                                    </div>
                                    <div className='font-satoshi font-semibold'>${(((i.price || 0) * (i.qty || 1))).toFixed(2)}</div>
                                    <button onClick={() => remove(i.slug)} className='w-[28px] h-[28px] bg-black text-lavender rounded-full text-xs'>X</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className='border border-pink rounded-lg p-4 h-fit'>
                    <h4 className='font-astrid text-[22px] mb-3'>Order Summary</h4>
                    <div className='flex justify-between py-2 border-b border-[#00000020]'>
                        <span className='font-satoshi text-[14px]'>Subtotal</span>
                        <span className='font-satoshi font-bold'>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between py-2 border-b border-[#00000020]'>
                        <span className='font-satoshi text-[14px]'>Shipping</span>
                        <span className='font-satoshi font-bold'>$4.99</span>
                    </div>
                    <div className='flex justify-between py-3'>
                        <span className='font-satoshi text-[14px]'>Estimated Total</span>
                        <span className='font-satoshi font-bold'>${(subtotal + 4.99).toFixed(2)}</span>
                    </div>
                    <Link href='/delivery-info' className='w-full block text-center bg-pink text-lavender rounded-full py-3 mt-2'>Proceed to Checkout</Link>
                </div>
            </div>

            <div className='mt-10'>
                <CTA />
            </div>
        </div>
    )
}

export default Page