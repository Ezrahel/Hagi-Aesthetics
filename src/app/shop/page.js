'use client'
import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import CTA from '@/components/CTA'

const page = () => {
    const products = [
        {
            id: 'hagis-whipped-velvet-elixir', name: 'Hagi’s Whipped Velvet Elixir',
            description: 'This premium product is crafted by Hagi Aesthetics, ensuring you receive a luxurious experience. The 8 oz (250 ml) bottle is perfect for those looking to enhance their skincare routine. The blend of Lavender and Vanilla offers a soothing aroma.',
            src: '/product1.png',
        },
        {
            id: 'suck-it-up-body-butter', name: 'Suck It Up Body Butter',
            description: 'Indulge in daily luxury with this gentle formula designed to hydrate and refresh your skin. Infused with the calming scent of Strawberry Vanilla for a spa-like experience.',
            src: '/product2.png',
        },
        {
            id: 'vietnamese-hair-vendor-list', name: 'Vietnamese Hair Vendor List',
            description: 'A carefully curated Vendor List that gives you access to verified beauty and lifestyle suppliers — the same ones successful small business owners trust. You’ll get: 📍 Direct contact details of suppliers (no middlemen) 🌐 Links to websites & social platforms 💰 Info on minimum order quantities (MOQs) 🚚 Shipping & fulfillment info (domestic & international)',
            src: '/product3.png',
        },
    ]

    return (
        <div>
            <div className='w-full h-[100vh]  relative text-pink px-5 lg:px-24 '>
                <Image
                    src="/bgs/shop1.webp"
                    alt="shop"
                    width={2600}
                    height={1600}
                    className='absolute left-0 top-0 w-full h-screen object-cover'
                />
                <div className='w-full h-screen flex justify-center items-center gap-5 text-center flex-col   relative z-10'>
                    <h1 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>Shop <br /></h1>
                </div>
            </div>
            <div className="w-full  lg:h-24 flex flex-col lg:flex-row justify-between items-center gap-2 lg:gap-0 bg-pink px-10 lg:px-24 py-4 lg:py-0">
                <div className='  text-lavender font-astrid text-[20px] lg:text-[28px] '>
                    All Products
                </div>
                <div className='w-full lg:w-[300px] h-[40px] relative bg-lavender border-2 border-pink rounded-full flex justify-between items-center px-1 py-1'>
                    <input
                        type="email"
                        // value={email}
                        // onChange={(e) => setEmail(e.target.value)}
                        placeholder="Search for products"
                        className="placeholder:text-pink bg-transparent font-montserrat font-medium text-[12px]  w-full outline-none relative left-3 lg:left-4"
                    />
                    <button
                        // onClick={handleSubscribe}
                        className='font-montserrat font-medium text-[12px] w-[80px] lg:w-[100px] h-full bg-pink text-lavender rounded-full  flex justify-center items-center hover:opacity-90 transition cursor-pointer'
                    >
                        Search
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-4 px-5 lg:px-24 py-[50px] lg:py-[100px]'>
                    {products.map((product) => (
                        <Link key={product.id} href={`/shop/${product.id}`} className='w-full lg:w-[400px] h-auto lg:h-[650px] flex flex-col justify-between gap-2 lg:gap-0 bg-white rounded-[20px] lg:rounded-[30px] text-pink p-4 lg:p-4'>
                            <Image src={product.src} alt="shop" width={500} height={500} className='w-full h-auto object-cover border-2 border-pink rounded-[20px] lg:rounded-[30px]' />
                            <h3 className='font-astrid text-[20px] lg:text-[28px]'>{product.name}</h3>
                            <p className='line-clamp-4 font-montserrat text-[14px] lg:text-[16px]'>
                                {product.description}
                            </p>
                            <div className='flex justify-between'>
                                <p className='font-montserrat font-bold text-[12px]'>Size: 8 oz (250 ml)</p>
                                <p className='font-montserrat font-bold text-[14px] lg:text-[16px]'>Price: $7.99</p>
                            </div>
                            <div className='flex gap-8 font-satoshi font-medium text-[12px]'>
                                <div className='w-full h-[36px]  border-2 border-pink rounded-full flex justify-center items-center uppercase'>Add to cart</div>
                                <div className='w-full h-[36px] text-lavender bg-pink border-2 border-pink rounded-full flex justify-center items-center uppercase'>Buy now</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className='w-full text-pink space-y-[40px] lg:space-y-[60px] pt-[50px] lg:pt-[100px] pb-[75px] lg:pb-[150px] '>
                <div className='text-center space-y-[10px] px-5 lg:px-0'>
                    <p className='font-montserrat font-bold text-[12px] uppercase'>Our values</p>
                    <h3 className='font-astrid text-[46px] lg:text-[84px] leading-12 lg:leading-20'>Why Choose <br /> Hagi Aesthetics?</h3>
                </div>
                <div className='w-full flex justify-start lg:justify-center items-center px-10 lg:px-0 gap-6 lg:gap-12 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
                    <div className='flex-shrink-0 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[16px] lg:rounded-[24px] text-center border-2 border-pink px-5 lg:px-[52px]'>
                        <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>🌿</h3>
                        <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Natural Ingredients</h3>
                        <p className='font-satoshi text-[16px] lg:text-[20px]'>
                            We use skin-loving ingredients that are safe and effective.
                        </p>
                    </div>
                    <div className='flex-shrink-0 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[16px] lg:rounded-[24px] text-center bg-pink text-lavender border-2 border-pink px-5 lg:px-[52px]'>
                        <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>🧖🏽‍♀️</h3>
                        <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Spa-Level Luxury</h3>
                        <p className='font-satoshi text-[16px] lg:text-[20px]'>
                            Skincare is an act of self-respect. We help make it sacred.
                        </p>
                    </div>
                    <div className='flex-shrink-0 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[16px] lg:rounded-[24px] text-center border-2 border-pink px-5 lg:px-[52px]'>
                        <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>🧪</h3>
                        <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Dermatologist Tested</h3>
                        <p className='font-satoshi text-[16px] lg:text-[20px]'>
                            Our body butters are crafted with care and clinically approved.
                        </p>
                    </div>
                </div>
            </div>

            <CTA />
        </div>
    )
}

export default page