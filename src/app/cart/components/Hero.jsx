import Image from 'next/image'
import React from 'react'

const Hero = () => {
    return (
        <div>
            <div className='w-full h-[70dvh]  relative text-pink px-5 lg:px-24 '>
                <Image
                    src="/bgs/cart1.webp"
                    alt="cart"
                    width={2600}
                    height={1600}
                    className='absolute left-0 top-0 w-full h-full object-fill'
                />
                <div className='text-pink w-full h-full flex justify-center items-center gap-5 text-center flex-col   relative z-10'>
                    <h1 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'> Shopping Cart</h1>
                </div>
            </div>
            <div className='w-full h-[30dvh] text-center flex flex-col gap-2 justify-center items-center text-pink px-5 lg:px-24 '>
                <h3 className='font-astrid text-[28px] lg:text-[36px]'>Your Cart</h3>
                <p className='w-full lg:w-[500px] font-satoshi text-[15px] lg:text-[16px]'>Review your items and proceed to checkout. Shipping and discounts are calculated at checkout.</p>
            </div>
        </div>
    )
}

export default Hero