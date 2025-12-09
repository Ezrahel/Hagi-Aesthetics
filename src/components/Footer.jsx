'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

const Footer = () => {
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
        <div className='w-full  text-pink relative'>
            <div className='w-full h-screen lg:h-[50Vh] flex items-center bg-[#1C1C1C]'>
                <div className='w-full flex flex-col lg:flex-row lg:justify-between px-5 lg:px-24 gap-12 lg:gap-0'>
                    <div className='w-full lg:w-auto flex flex-col justify-between order-1 lg:order-none'>
                        <Image src="/logo.png" alt="logo" width={100} height={100} className='w-[45px] lg:w-[85px] h-auto' />
                        <h3 className='font-astrid text-[28px] lg:text-[36px]'>Hagi Aesthetics</h3>
                        <p className='font-satoshi font-light italic text-[16px] lg:text-[20px]'>Skincare that feels like poetry</p>
                        <p className='font-satoshi font-light italic text-[16px] lg:text-[20px]'>hagiaesthetics@gmail.com</p>
                    </div>
                    <div className='w-full lg:w-auto flex flex-row  gap-4 lg:gap-36 order-2 lg:order-none'>
                        <div className='w-1/2 lg:w-auto flex flex-col font-satoshi text-[14px] lg:text-[18px] text-pink uppercase'>
                            <Link href='/' className='py-[12px] lg:py-[6px] lg:p-[6px]'>
                                <span className='border-b border-pink pb-[2px]'>Home</span>
                            </Link>
                            <Link href='/shop' className='py-[12px] lg:py-[6px] lg:p-[6px]'>
                                <span className='border-b border-pink pb-[2px]'>Shop</span>
                            </Link>
                            <Link href='/aboutus' className='py-[12px] lg:py-[6px] lg:p-[6px]'>
                                <span className='border-b border-pink pb-[2px]'>About us</span>
                            </Link>
                            <Link href='/faq' className='py-[12px] lg:py-[6px] lg:p-[6px]'>
                                <span className='border-b border-pink pb-[2px]'>Faq</span>
                            </Link>
                            <Link href='/contactus' className='py-[12px] lg:py-[6px] lg:p-[6px]'>
                                <span className='border-b border-pink pb-[2px]'>Contact us</span>
                            </Link>
                        </div>
                        <div className='w-1/2 lg:w-auto flex flex-col font-satoshi text-[14px] lg:text-[18px] text-pink uppercase'>
                            <Link href='/' className='py-[12px] lg:py-[6px] lg:p-[6px]'>
                                <span className='border-b border-pink '>Shipping & Returns</span>
                            </Link>
                            <Link href='/shop' className='py-[12px] lg:py-[6px] lg:p-[6px]'>
                                <span className='border-b border-pink '>Privacy Policy</span>
                            </Link>
                            <Link href='/aboutus' className='py-[12px] lg:py-[6px] lg:p-[6px]'>
                                <span className='border-b border-pink '>Terms of service</span>
                            </Link>
                        </div>
                    </div>
                    <div className='w-full lg:w-auto relative text-pink order-3 lg:order-none'>
                        <div className='relative w-full h-full flex flex-col justify-start items-center gap-3 lg:gap-6'>
                            <h1 className='font-astrid text-[26px] lg:text-[32px] leading-6'>Join the Glow Club</h1>
                            <p className='font-montserrat  text-[12px] text-center'>
                                Sign up for self-care tips, exclusive offers, and <br />skincare drops.
                            </p>
                            <div className='w-full lg:w-[300px] h-[36px] relative bg-lavender border-2 border-pink rounded-full flex items-center px-6'>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    className="bg-transparent font-montserrat font-medium text-[12px]  w-full outline-none "
                                />
                                <button
                                    onClick={handleSubscribe}
                                    className='font-montserrat font-medium text-[12px] w-[100px] h-full bg-pink text-lavender rounded-full absolute right-0 top-0 flex justify-center items-center hover:opacity-90 transition cursor-pointer'
                                >
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='absolute bottom-4  w-full text-center'>
                <p className='font-montserrat  text-[12px] lg:text-[16px] text-lavender'>© 2025 Hagi Aesthetics. All Rights Reserved.</p>
            </div>
        </div>
    );
};

export default Footer;
