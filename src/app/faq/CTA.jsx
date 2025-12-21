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
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
            console.log("Subscribed email:", email);
        }
        alert(`Thanks for subscribing, ${email}!`);
        setEmail('');
    };
    return (
        <div className='w-full h-[50Vh] relative text-pink px-5 lg:px-0'>
            <Image
                src="/img_.jpeg"
                alt="footer"
                width={1000}
                height={1000}
                className='absolute left-0 top-0 w-full h-full object-cover'
            />
            <div className='relative w-full h-full flex flex-col justify-center items-center gap-4 lg:gap-6'>
                <h1 className='font-astrid text-[48px] lg:text-[72px] leading-14 lg:leading-[90%] text-center '>Still Have Questions?</h1>
                <p className='font-montserrat font-medium text-[16px] lg:text-[18px] text-center'>
                    Couldn’t find what you’re looking for? <br />Reach out to us directly via Contact Us Page or email — we’re always here to help.
                </p>
                <div className=' relative '>
                    <button
                        onClick={handleSubscribe}
                        className='font-montserrat font-medium  text-[15px] lg:text-[18px] w-[125px] lg:w-[175px] h-[40px] lg:h-[52px] bg-pink text-lavender rounded-full  flex justify-center items-center hover:opacity-90 transition cursor-pointer'
                    >
                        Contact Us
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CTA