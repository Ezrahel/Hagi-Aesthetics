'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CTA from '@/components/CTA'

const Page = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        deliveryInstructions: ''
    })

    // Load saved delivery info if available
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('deliveryInfo')
            if (saved) {
                try {
                    setFormData(JSON.parse(saved))
                } catch (e) {
                    console.error('Failed to load saved delivery info', e)
                }
            }
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setError('Full name is required')
            return false
        }
        if (!formData.email.trim()) {
            setError('Email is required')
            return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address')
            return false
        }
        if (!formData.phone.trim()) {
            setError('Phone number is required')
            return false
        }
        if (!formData.address.trim()) {
            setError('Address is required')
            return false
        }
        if (!formData.city.trim()) {
            setError('City is required')
            return false
        }
        if (!formData.state.trim()) {
            setError('State is required')
            return false
        }
        if (!formData.zipCode.trim()) {
            setError('Zip code is required')
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        
        if (!validateForm()) {
            return
        }

        setLoading(true)
        try {
            // Save to localStorage
            localStorage.setItem('deliveryInfo', JSON.stringify(formData))

            // Send email with delivery details
            const response = await fetch('/api/send-delivery-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'Failed to send delivery information')
            }

            // Redirect to checkout
            router.push('/checkout')
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className='pt-20 min-h-screen bg-gray-50'>
            <div className='max-w-2xl mx-auto px-5 lg:px-8 py-10'>
                <div className='bg-white rounded-lg shadow-lg p-6 lg:p-8'>
                    <h1 className='font-astrid text-[32px] lg:text-[40px] mb-2 text-pink'>Delivery Information</h1>
                    <p className='font-satoshi text-[14px] lg:text-[16px] text-gray-600 mb-6'>
                        Please provide your delivery details to proceed with checkout
                    </p>

                    {error && (
                        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6'>
                            <p className='font-satoshi text-sm'>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                Full Name <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type='text'
                                name='fullName'
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                                placeholder='John Doe'
                            />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                    Email <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                                    placeholder='john@example.com'
                                />
                            </div>

                            <div>
                                <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                    Phone <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='tel'
                                    name='phone'
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                                    placeholder='(555) 123-4567'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                Street Address <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type='text'
                                name='address'
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                                placeholder='123 Main Street'
                            />
                        </div>

                        <div>
                            <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                Apartment, suite, etc. (optional)
                            </label>
                            <input
                                type='text'
                                name='address2'
                                value={formData.address2}
                                onChange={handleChange}
                                className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                                placeholder='Apt 4B'
                            />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div>
                                <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                    City <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    name='city'
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                                    placeholder='New York'
                                />
                            </div>

                            <div>
                                <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                    State <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    name='state'
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                                    placeholder='NY'
                                />
                            </div>

                            <div>
                                <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                    Zip Code <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    name='zipCode'
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    required
                                    className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                                    placeholder='10001'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                Country
                            </label>
                            <input
                                type='text'
                                name='country'
                                value={formData.country}
                                onChange={handleChange}
                                className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                            />
                        </div>

                        <div>
                            <label className='block font-satoshi font-medium text-[14px] mb-2 text-pink'>
                                Delivery Instructions (optional)
                            </label>
                            <textarea
                                name='deliveryInstructions'
                                value={formData.deliveryInstructions}
                                onChange={handleChange}
                                rows={3}
                                className='w-full border border-[#00000050] rounded px-4 py-3 font-satoshi text-[14px] focus:ring-2 focus:ring-pink focus:border-pink outline-none'
                                placeholder='Leave at front door, ring doorbell, etc.'
                            />
                        </div>

                        <div className='flex gap-4 pt-4'>
                            <Link
                                href='/cart'
                                className='px-6 py-3 border-2 border-pink rounded-full font-montserrat font-medium text-[14px] uppercase text-pink hover:bg-pink hover:text-white transition-colors'
                            >
                                Back to Cart
                            </Link>
                            <button
                                type='submit'
                                disabled={loading}
                                className='flex-1 px-6 py-3 bg-pink text-lavender rounded-full font-montserrat font-medium text-[14px] uppercase hover:bg-pink/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                            >
                                {loading ? 'Processing...' : 'Continue to Checkout'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className='mt-10'>
                <CTA />
            </div>
        </div>
    )
}

export default Page

