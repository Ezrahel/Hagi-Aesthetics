import Image from 'next/image'
import React from 'react'

const Banner = () => {


    return (
        <div className='w-[110vw] h-[60px] lg:h-[100px] flex justify-evenly items-center bg-pink text-lavender relative right-4 lg:right-24 z-10 mt-16'>
            {[0, 1, 2, 3, 4].map((item, i) => (
                <div
                    key={i}
                    className={`flex gap-[6px] lg:gap-[10px] ${item.visible === 'lg' ? 'hidden lg:flex' : 'flex'
                        }`}
                >
                    <Image
                        src='/icons/bannericon.svg'
                        alt="bannericon"
                        width={60}
                        height={60}
                        className='w-[28px] lg:w-[54px] h-auto'
                    />
                    <h3 className='font-astrid text-[20px] lg:text-[32px]'>Clear Skin</h3>
                </div>
            ))}
        </div>
    )
}

export default Banner
