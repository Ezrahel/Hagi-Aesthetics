'use client'
import Image from 'next/image'
import React, { useState } from 'react'

const CTA = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = () => {
        if (!email) {
            alert('Please enter your email');
            return;
        }
        console.log("Subscribed email:", email);
        alert(`Thanks for subscribing, ${email}!`);
        setEmail('');
    };
    return (
        <div className='w-full h-[50Vh] relative text-pink px-5 lg:px-0'>
            <Image
                src="/footer2.png"
                alt="footer"
                width={1000}
                height={1000}
                className='absolute left-0 top-0 w-full h-full object-cover'
            />
            <div className='relative w-full h-full flex flex-col justify-center items-center gap-4 lg:gap-6'>
                <h1 className='font-astrid text-[48px] lg:text-[72px] leading-14 lg:leading-[90%] text-center '><a href='#'>Join the Glow Club</a></h1>
                <p className='font-montserrat font-medium text-[16px] lg:text-[18px] text-center'>
                    Sign up for self-care tips, exclusive offers, and skincare drops.
                </p>
                <div className='w-full lg:w-[600px] h-[44px] lg:h-[52px] relative bg-lavender border-2 border-pink rounded-full flex items-center px-4 lg:px-10'>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="bg-transparent font-montserrat font-medium text-[15px] lg:text-[18px]  w-full outline-none "
                    />
                    <button
                        onClick={handleSubscribe}
                        className='font-montserrat font-medium text-[15px] lg:text-[18px] w-[40%] lg:w-[175px] h-full bg-pink text-lavender rounded-full absolute right-0 top-0 flex justify-center items-center hover:opacity-90 transition cursor-pointer'
                    >
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CTA