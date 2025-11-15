'use client'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'

const page = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products')
                const data = await response.json()
                
                if (response.ok) {
                    setProducts(data.products)
                } else {
                    setError('Failed to load products')
                }
            } catch (err) {
                setError('Failed to load products')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className='px-5 lg:px-24 py-16 text-pink'>
            <h1 className='font-astrid text-[32px] lg:text-[50px] mb-8'>Shop</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
                {products.map((p) => (
                    <Link key={p.id} href={`/shop/${p.id}`} className='border border-pink rounded-lg p-4 hover:shadow-lg transition'>
                        <Image src={p.image} alt={p.name} width={600} height={600} className='w-full h-auto rounded mb-3' />
                        <h3 className='font-astrid text-[22px] mb-1'>{p.name}</h3>
                        <p className='font-satoshi text-[14px] text-gray-700 mb-2'>{p.productno}</p>
                        {typeof p.price === 'number' && (
                            <p className='font-montserrat font-semibold text-[16px]'>${p.price.toFixed(2)}</p>
                        )}
                    </Link>
                ))}
            </div>
            {products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No products available at the moment.
                </div>
            )}
        </div>
    )
}

export default page