'use client'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { productData } from '@/utils'

const page = () => {
    const entries = Object.entries(productData)
    return (
        <div className='px-5 lg:px-24 py-16 text-pink'>
            <h1 className='font-astrid text-[32px] lg:text-[50px] mb-8'>Shop</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
                {entries.map(([slug, p]) => (
                    <Link key={slug} href={`/shop/${slug}`} className='border border-pink rounded-lg p-4 hover:shadow-lg transition'>
                        <Image src={p.image} alt={p.name} width={600} height={600} className='w-full h-auto rounded mb-3' />
                        <h3 className='font-astrid text-[22px] mb-1'>{p.name}</h3>
                        <p className='font-satoshi text-[14px] text-gray-700 mb-2'>{p.productno}</p>
                        {typeof p.price === 'number' && (
                            <p className='font-montserrat font-semibold text-[16px]'>${p.price.toFixed(2)}</p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default page