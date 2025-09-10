'use client'
import CTA from '@/components/CTA'
import Image from 'next/image'
import React from 'react'

const page = () => {
    return (
        <div>
            <div className='w-full h-[100vh]  relative text-pink px-5 lg:px-24 '>
                <Image
                    src="/bgs/contactus1.webp"
                    alt="contactus"
                    width={2600}
                    height={1600}
                    className='absolute left-0 top-0 w-full h-screen object-cover'
                />
                <div className='w-full h-screen flex flex-col-reverse lg:flex-row  justify-center items-center gap-10 lg:gap-5 relative top-4 lg:top-8 z-10'>
                    <div className='w-full lg:w-[50%] space-y-8 lg:space-y-6'>
                        <div className='flex flex-col '>
                            <label htmlFor='name' className='font-satoshi text-[18px] lg:text-[22px]'>Your Name</label>
                            <input id='name' type="text" className='w-full lg:w-[600px] h-[36px] lg:h-[48px]  border-b-2 border-pink px-0 font-montserrat font-medium text-[15px] lg:text-[18px] outline-none' />
                        </div>
                        <div className='flex flex-col '>
                            <label htmlFor='name' className='font-satoshi  text-[18px] lg:text-[22px]'>Your Email</label>
                            <input id='name' type="text" className='w-full lg:w-[600px] h-[36px] lg:h-[48px]  border-b-2 border-pink px-0 font-montserrat font-medium text-[15px] lg:text-[18px] outline-none' />
                        </div>
                        <div className='flex flex-col '>
                            <label htmlFor='name' className='font-satoshi  text-[18px] lg:text-[22px]'>Share your thoughts</label>
                            <input id='name' type="text" className='w-full lg:w-[600px] h-[36px] lg:h-[48px]  border-b-2 border-pink px-0 font-montserrat font-medium text-[15px] lg:text-[18px] outline-none' />
                        </div>
                        <div className='w-[125px] lg:w-[175px] text-lavender bg-pink border-2  border-pink  flex justify-center items-center gap-2 lg:gap-3 text-center rounded-full  py-3 lg:py-4 relative top-4 lg:top-6 cursor-pointer'>
                            <h3 className='font-satoshi font-black text-[15px] lg:text-[18px] leading-0 uppercase'>Submit</h3>
                            <Image src="/icons/submit.svg" alt="logo" width={50} height={50} className='w-[20px] lg:w-[24px] h-auto' />
                        </div>
                    </div>
                    <div className='w-full lg:w-[50%] flex flex-col justify-center items-center relative font-astrid  text-[50px] lg:text-[90px] leading-12 lg:leading-24 overflow-hidden'>
                        <h1 className='relative right-12 lg:right-24'>Contact</h1>
                        <h1 className='relative left-12 lg:left-24'>Us</h1>
                    </div>
                </div>
            </div>
            <div className='w-full h-16 lg:h-24 flex items-center bg-pink text-lavender font-astrid text-[20px] lg:text-[28px] px-10 lg:px-24'>
                Use Live Location
            </div>
            <CTA />
        </div>
    )
}

export default page