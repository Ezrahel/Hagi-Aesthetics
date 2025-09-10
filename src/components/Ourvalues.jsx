import Image from 'next/image'
import React from 'react'

const Ourvalues = () => {
    return (
        <div className='text-pink'>
            <div className='w-full flex flex-col gap-6 lg:gap-0 lg:flex-row py-14 lg:py-36 px-5 lg:px-24'>
                <div className='w-full lg:w-1/2 flex  justify-center lg:justify-start items-center'>
                    <Image src="/product4.png" alt="logo" width={1800} height={1800} className='w-full lg:w-[500px] h-auto' />
                </div>
                <div className='w-full lg:w-1/2 flex flex-col justify-center gap-2 lg:gap-4'>
                    <p className='font-montserrat font-bold text-[12px] uppercase'>product 04</p>
                    <h3 className='font-astrid text-[36px] lg:text-[56px] leading-10 lg:leading-16'>Made with Love by Hagi  <br />  Aesthetics</h3>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>At Hagi Aesthetics, we believe skincare should be more than routine — it should be a ritual of love, calm, and self-celebration. Every jar we craft is rooted in clean ingredients, gentle formulations, and our commitment to ethical beauty. </p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>From our lab to your hands, we’re proud to be cruelty-free, intentional, and obsessed with softness.</p>
                    <div className='w-[60vw] lg:w-[275px] bg-[#F5E0FF] border-2  border-pink  flex justify-center items-center gap-3 text-center rounded-full  py-[10px] lg:py-4 relative top-4 lg:top-10'>
                        <h3 className='font-montserrat font-medium text-[13px] lg:text-[17px] leading-0'>Begin your Ritual</h3>
                        <Image src="/icons/Vector.svg" alt="logo" width={50} height={50} className='w-[16px] lg:w-[17px] h-auto' />
                    </div>
                </div>
            </div>
            <div className='w-full h-full  grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-6  justify-evenly items-center bg-pink mb-[50px] lg:mb-[100px] px-5 lg:px-16 py-6 lg:py-8 mt-4 lg:mt-0'>
                <div className='h-[75px] lg:h-[90px] flex justify-center items-center text-center bg-lavender rounded-[12px] lg:rounded-[16px] px-6 lg:px-12 '>
                    <div className='font-montserrat font-medium text-[13px] lg:text-[15px]'>
                        <h3 className='text-[22px] lg:text-[32px]'>🌿</h3>
                        Clean Ingredients
                    </div>
                </div>
                <div className='h-[75px] lg:h-[90px] flex justify-center items-center text-center bg-lavender rounded-[12px] lg:rounded-[16px] px-6 lg:px-12 '>
                    <div className='font-montserrat font-medium text-[13px] lg:text-[15px]'>
                        <h3 className='text-[22px] lg:text-[32px]'>🧪</h3>
                        Dermatologist-Formulated
                    </div>
                </div>
                <div className='h-[75px] lg:h-[90px] flex justify-center items-center text-center bg-lavender rounded-[12px] lg:rounded-[16px] px-6 lg:px-12 '>
                    <div className='font-montserrat font-medium text-[13px] lg:text-[15px]'>
                        <h3 className='text-[22px] lg:text-[32px]'>🐰</h3>
                        Cruelty-Free
                    </div>
                </div>
                <div className='h-[75px] lg:h-[90px] flex justify-center items-center text-center bg-lavender rounded-[12px] lg:rounded-[16px] px-6 lg:px-12 '>
                    <div className='font-montserrat font-medium text-[13px] lg:text-[15px]'>
                        <h3 className='text-[22px] lg:text-[32px]'>💜</h3>
                        Small Batch Crafted
                    </div>
                </div>
                <div className='h-[75px] lg:h-[90px] flex justify-center items-center text-center bg-lavender rounded-[12px] lg:rounded-[16px] px-6 lg:px-12 '>
                    <div className='font-montserrat font-medium text-[13px] lg:text-[15px]'>
                        <h3 className='text-[22px] lg:text-[32px]'>🌍</h3>
                        Sustainable Packaging
                    </div>
                </div>
            </div>
            <div className='w-full flex flex-col justify-center items-center gap-4 lg:gap-6 text-center px-5 lg:px-12 mb-[50px] lg:mb-[100px] '>
                <h1 className='w-full font-astrid text-[40px] lg:text-[64px] leading-[110%]'>I created HagiAesthetics to build confidence. When you look good,you feel good!</h1>
                <p className='uppercase font-montserrat font-bold text-[12px]'>Founder</p>
                <div className='w-[80%] lg:w-[300px] h-[44px] lg:h-[56px] flex justify-center items-center gap-3 lg:gap-4 border border-pink rounded-full'>
                    <p className='font-montserrat font-medium text-[14px] lg:text-[17px]'>Learn More About Us</p>
                    <Image src="/icons/Vector.svg" alt="logo" width={50} height={50} className='w-[15px] lg:w-[17px] h-auto' />
                </div>
            </div>
        </div>
    )
}

export default Ourvalues