import Image from 'next/image'
import React from 'react'

const Ourvalues = () => {
    return (
        <div className='w-full text-pink space-y-[40px] lg:space-y-[60px] pt-[50px] lg:pt-[100px] pb-[75px] lg:pb-[150px] '>
            <div className='text-center space-y-[10px] px-5 lg:px-0'>
                <p className='font-montserrat font-bold text-[12px] uppercase'>Our values</p>
                <h3 className='font-astrid text-[46px] lg:text-[84px] leading-12 lg:leading-20'>What we stand for</h3>
            </div>
            <div className='w-full flex justify-start lg:justify-center items-center px-10 lg:px-0 gap-6 lg:gap-12 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
                <div className='flex-shrink-0 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[16px] lg:rounded-[24px] text-center border-2 border-pink px-5 lg:px-[52px]'>
                    <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>🌿</h3>
                    <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Clean Beauty</h3>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        No harsh chemicals. No fillers. Just honest ingredients.
                    </p>
                </div>
                <div className='flex-shrink-0 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[16px] lg:rounded-[24px] text-center bg-pink text-lavender border-2 border-pink px-5 lg:px-[52px]'>
                    <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>🌿</h3>
                    <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Self-Love</h3>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        Skincare is an act of self-respect. We help make it sacred.
                    </p>
                </div>
                <div className='flex-shrink-0 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[16px] lg:rounded-[24px] text-center border-2 border-pink px-5 lg:px-[52px]'>
                    <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>🌿</h3>
                    <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Every Body Welcome</h3>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        Inclusive. Intentional. Made for all skin tones & types.
                    </p>
                </div>
            </div>
            <div className='w-full flex flex-col justify-center items-center text-center gap-4 lg:gap-6 px-5 lg:px-12 pt-[75px] lg:pt-[150px]'>
                <h3 className='w-full font-astrid text-[36px] lg:text-[56px] leading-[105%] lg:leading-[110%]'>“I created Hagi Aesthetics to give women <br />something more than skincare — I wanted to give <br />them a moment. A pause. A glow-up from the <br />inside out.”</h3>
                <p className='font-montserrat font-bold text-[12px] uppercase'>Founder</p>
                <div className='w-[80%] lg:w-[300px] h-[44px] lg:h-[56px] bg-[#F5E0FF] border-2  border-pink  flex justify-center items-center gap-3 lg:gap-4 text-center rounded-full  py-4 '>
                    <h3 className='font-montserrat font-medium text-[14px] lg:text-[17px]'>Learn More About Us</h3>
                    <Image src="/icons/Vector.svg" alt="logo" width={50} height={50} className='w-[15px] lg:w-[17px] h-auto' />
                </div>
            </div>
        </div>
    )
}

export default Ourvalues