import Image from 'next/image'
import React from 'react'

const Hero = () => {
    return (
        <div className='w-full h-[100dvh] lg:h-screen flex justify-center items-center gap-4  lg:gap-5 text-center flex-col bg-transparent text-pink relative z-10 px-5 lg:px-0'>
            <p className=' uppercase font-montserrat font-bold text-[11px] lg:text-[12px]'>Indulge in the Luxury of Soft Skin.</p>
            <h1 className='font-astrid tracking-tight lg:tracking-normal  text-[50px] lg:text-[90px] leading-13 lg:leading-24'>Welcome to <br /> Hagi Aesthetics</h1>
            <p className='font-satoshi text-[16px] lg:text-[20px]'>Where skincare meets serenity. Each formula is a gentle blend of care, comfort, and clean  <br /> beauty — crafted to indulge your skin and elevate your routine.</p>

            <div className='w-[60vw] lg:w-[300px] bg-[#F5E0FF] border-2  border-pink  flex justify-center items-center gap-3 text-center rounded-full py-3 lg:py-5 relative top-6 lg:top-10'>
                <h3 className='font-montserrat font-medium text-[14px] lg:text-[20px] leading-0'>Begin your Ritual</h3>
                <Image src="/icons/Vector.svg" alt="logo" width={50} height={50} className='w-[16px] lg:w-[18px] h-auto' />
            </div>
            <div className='absolute bottom-4 flex flex-col justify-center items-center gap-2'>
                <p className='font-montserrat font-medium text-[16px]'>Scroll Down</p>
                <Image src="/icons/scrollarrows.svg" alt="logo" width={50} height={50} className='w-[14px] h-auto' />
            </div>
        </div>
    )
}

export default Hero