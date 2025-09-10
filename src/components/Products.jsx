import Image from 'next/image'
import React from 'react'

const Products = () => {
    return (
        <div className='text-pink pt-[50px] lg:pt-[100px] relative z-20'>
            <h1 className='font-astrid text-[32px] lg:text-[50px] text-center'>Our Products</h1>
            {/* product1 */}
            <div className='w-full flex flex-col gap-6 lg:gap-0 lg:flex-row py-10 lg:py-36 px-5 lg:px-24'>
                <div className='w-full lg:w-1/2 flex  justify-center lg:justify-start items-center'>
                    <Image src="/product1.png" alt="logo" width={1800} height={1800} className='w-full lg:w-[500px] h-auto' />
                </div>
                <div className='w-full lg:w-1/2 flex flex-col justify-center gap-2 lg:gap-4'>
                    <p className='font-montserrat font-bold text-[12px] uppercase'>product 01</p>
                    <h3 className='font-astrid text-[36px] lg:text-[56px] leading-10 lg:leading-16'>Hagi’s Whipped <br /> Velvet Elixir</h3>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>This premium product is crafted by Hagi Aesthetics, ensuring you receive a luxurious experience. The 8 oz (250 ml) bottle is perfect for those looking to enhance their skincare routine. The blend of Lavender and Vanilla offers a soothing aroma.</p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>Packaged in an 8 oz (250 ml) jar — perfect for your self-care rituals.</p>
                    <div className='w-[60vw] lg:w-[275px] bg-[#F5E0FF] border-2  border-pink  flex justify-center items-center gap-3 text-center rounded-full  py-[10px] lg:py-4 relative top-4 lg:top-10'>
                        <h3 className='font-montserrat font-medium text-[13px] lg:text-[17px] leading-0'>Begin your Ritual</h3>
                        <Image src="/icons/Vector.svg" alt="logo" width={50} height={50} className='w-[16px] lg:w-[17px] h-auto' />
                    </div>
                </div>
            </div>
            {/* product2 */}
            <div className='w-full flex flex-col-reverse gap-6 lg:gap-0 lg:flex-row py-10 lg:py-36 px-5 lg:px-24'>
                <div className='w-full lg:w-1/2 flex flex-col justify-center gap-2 lg:gap-4'>
                    <p className='font-montserrat font-bold text-[12px] uppercase'>product 02</p>
                    <h3 className='font-astrid text-[36px] lg:text-[56px] leading-10 lg:leading-16'>Suck It Up Body Butter  <br />(Standard)</h3>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>Add our Suck It Up Body Butter to your daily care regimen. Its gentle formula is designed to moisturize and soothe your skin. It comes in an 8 oz (250 ml) container, offering a rich, indulgent experience. Enjoy the softness and the delightful scent every time you use it. 🌿</p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>Packaged in an 8 oz (250 ml) jar — perfect for your self-care rituals.</p>
                    <div className='w-[60vw] lg:w-[275px] bg-[#F5E0FF] border-2  border-pink  flex justify-center items-center gap-3 text-center rounded-full  py-[10px] lg:py-4 relative top-4 lg:top-10'>
                        <h3 className='font-montserrat font-medium text-[13px] lg:text-[17px] leading-0'>Begin your Ritual</h3>
                        <Image src="/icons/Vector.svg" alt="logo" width={50} height={50} className='w-[16px] lg:w-[17px] h-auto' />
                    </div>
                </div>
                <div className='w-full lg:w-1/2 flex  justify-center lg:justify-end items-center'>
                    <Image src="/product2.png" alt="logo" width={1800} height={1800} className='w-[500px] h-auto' />
                </div>
            </div>
            {/* product3 */}
            <div className='w-full flex flex-col gap-6 lg:gap-0 lg:flex-row py-10 lg:py-36 px-5 lg:px-24'>
                <div className='w-full lg:w-1/2 flex  justify-center lg:justify-start items-center'>
                    <Image src="/product3.png" alt="logo" width={1800} height={1800} className='w-[500px] h-auto' />
                </div>
                <div className='w-full lg:w-1/2 flex flex-col justify-center gap-2 lg:gap-4'>
                    <p className='font-montserrat font-bold text-[12px] uppercase'>product 03</p>
                    <h3 className='font-astrid text-[36px] lg:text-[56px] leading-10 lg:leading-16'>Vietnamese Hair <br />  Vendor List</h3>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>A carefully curated Vendor List that gives you access to WhatsApp numbers & direct communication. </p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>Product Categories: Vietnamese, Brazilian, Indian, etc — the same ones successful small business owners trust. You’ll get: 📍 Direct contact details of suppliers (no middlemen) 🌐 Links to websites & social platforms 💰 Info on minimum order quantities (MOQs) 🚚 Shipping & fulfillment info (domestic & international)</p>
                    <div className='w-[60vw] lg:w-[275px] bg-[#F5E0FF] border-2  border-pink  flex justify-center items-center gap-3 text-center rounded-full  py-[10px] lg:py-4 relative top-4 lg:top-10'>
                        <h3 className='font-montserrat font-medium text-[13px] lg:text-[17px] leading-0'>Begin your Ritual</h3>
                        <Image src="/icons/Vector.svg" alt="logo" width={50} height={50} className='w-[16px] lg:w-[17px] h-auto' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Products