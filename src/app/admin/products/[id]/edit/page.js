'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function EditProduct({ params }) {
    const { id } = params
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        productno: '',
        description: '',
        description2: '',
        productdetails: '',
        price: '',
        image: ''
    })


    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const loadProduct = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error

            setFormData({
                name: data.name || '',
                productno: data.productno || '',
                description: data.description || '',
                description2: data.description2 || '',
                productdetails: data.productdetails || '',
                price: data.price?.toString() || '',
                image: data.image || ''
            })
        } catch (err) {
            setError('Failed to load product: ' + err.message)
            console.error(err)
        } finally {
            setInitialLoading(false)
        }
    }, [id]) // ➡️ Dependency array for useCallback: only rerun if `id` changes

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || user.email !== 'admin@hagiaesthetics.store') {
                router.push('/admin/login')
                return
            }
            setUser(user)
            loadProduct()
        }
        checkAuth()
    }, [router, id, loadProduct])

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Image src="/logo.png" alt="Hagi Aesthetics" width={32} height={32} />
                            <h1 className="ml-3 text-xl font-semibold text-gray-900">Edit Product</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">{user?.email}</span>
                            <button
                                onClick={() => router.push('/admin')}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="productno" className="block text-sm font-medium text-gray-700">
                                        Product Number
                                    </label>
                                    <input
                                        type="text"
                                        name="productno"
                                        id="productno"
                                        required
                                        value={formData.productno}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        id="price"
                                        required
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        name="image"
                                        id="image"
                                        required
                                        value={formData.image}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        rows={3}
                                        required
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description2" className="block text-sm font-medium text-gray-700">
                                        Extended Description
                                    </label>
                                    <textarea
                                        name="description2"
                                        id="description2"
                                        rows={3}
                                        value={formData.description2}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="productdetails" className="block text-sm font-medium text-gray-700">
                                        Product Details Title
                                    </label>
                                    <input
                                        type="text"
                                        name="productdetails"
                                        id="productdetails"
                                        value={formData.productdetails}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.push('/admin')}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-pink text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
