import Image from 'next/image'
import React from 'react'
import CTA from './components/CTA'
import Mission from './components/Mission'
import Ourvalues from './components/Ourvalues'

const page = () => {
    return (
        <div>
            <div className='w-full h-[100vh]  relative text-pink px-5 lg:px-24 '>
                <Image
                    src="/bgs/aboutus1.webp"
                    alt="aboutus"
                    width={2600}
                    height={1600}
                    className='absolute left-0 top-0 w-full h-screen object-cover'
                />
                <div className='w-full h-screen flex justify-center items-center gap-4 lg:gap-5 text-center flex-col   relative z-10'>
                    <p className=' uppercase font-montserrat font-bold text-[12px]'>Indulge in the Luxury of Soft Skin.</p>
                    <h1 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>About <br /> Hagi Aesthetics</h1>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>Skincare that feels like self-love.</p>
                </div>
            </div>
            <Mission />
            <Ourvalues />
            <CTA />
        </div>
    )
}

export default page