import Image from 'next/image'
import React from 'react'

const Testimonials = () => {
    const testimonials = [
        {
            img: "/testimonial1.png",
            text: "Smells amazing and leaves my skin so soft! I use it every morning — it’s a dream.",
            name: "Tina A.",
        },
        {
            img: "/testimonial2.png",
            text: "I have dry skin, and this makes my legs feel brand new. 10/10!",
            name: "Lola S.",
        },
        {
            img: "/testimonial3.png",
            text: "This is the best body butter I’ve ever tried. The scent stays all day.",
            name: "Ada M.",
        },
        {
            img: "/testimonial4.png",
            text: "I use this every night before bed. Feels like a warm hug on my skin.",
            name: "Michelle B.",
        },
    ];

    return (
        <div className='w-full text-pink pt-[100px] pb-[70px]'>
            <h1 className='font-astrid text-[50px] text-center'>Testimonials</h1>
            <div className='flex justify-center items-center gap-[24px] px-[24px] py-20 flex-wrap'>
                {testimonials.map((t, i) => (
                    <div
                        key={i}
                        className='w-[350px] h-[500px] flex flex-col justify-between items-center text-center rounded-[15px] bg-white px-[10px] py-[10px]'
                    >
                        <Image src={t.img} alt={t.name} width={350} height={350} className='w-[350px] h-auto' />
                        <div>🌟🌟🌟🌟🌟</div>
                        <p className='font-satoshi text-[18px] text-black'>{t.text}</p>
                        <h3 className='font-astrid text-[18px] uppercase'>{t.name}</h3>
                    </div>
                ))}
            </div>
            <div className='w-full flex justify-center items-center gap-[62px]'>
                <Image src="/icons/larrow.svg" alt="left arrow" width={40} height={40} className='w-[36px] h-auto cursor-pointer' />
                <Image src="/icons/rarrow.svg" alt="right arrow" width={40} height={40} className='w-[36px] h-auto cursor-pointer' />
            </div>
        </div>
    )
}

export default Testimonials
