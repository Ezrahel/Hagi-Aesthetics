import Image from 'next/image'
import React from 'react'

const WhyUs = () => {
    const items = [
        { src: "/icons/creditcard.svg", label: "Affordable" },
        { src: "/icons/Sparkles.svg", label: "Sustainable" },
        { src: "/icons/UserAdd.svg", label: "All Skin Types" },
        { src: "/icons/Sun.svg", label: "Cruelty Free" },
    ];

    return (
        <div className='w-full grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 justify-center items-center text-pink py-10'>
            {items.map((item, index) => (
                <div key={index} className='flex flex-col gap-[6px] lg:gap-[10px] justify-center items-center'>
                    <Image
                        src={item.src}
                        alt={item.label}
                        width={50}
                        height={50}
                        className='w-[24px] lg:w-[35px] h-auto'
                    />
                    <h3 className='font-satoshi text-[16px] lg:text-[18px]'>{item.label}</h3>
                </div>
            ))}
        </div>
    )
}

export default WhyUs
