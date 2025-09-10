import CTA from '@/components/CTA'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const page = () => {
    return (
        <div>
            <div className='w-full h-[70dvh]  relative text-pink px-5 lg:px-24 '>
                <Image
                    src="/bgs/checkout1.webp"
                    alt="checkout"
                    width={2600}
                    height={1600}
                    className='absolute left-0 top-0 w-full h-full object-fill'
                />
                <div className='text-pink w-full h-full flex justify-center items-center gap-5 text-center flex-col   relative z-10'>
                    <h1 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'> Checkout</h1>
                </div>
            </div>
            <div className='w-full h-[30dvh] text-center flex flex-col gap-2 justify-center items-center text-pink px-5 lg:px-24 '>
                <h3 className='font-astrid text-[28px] lg:text-[36px]'>Your Shopping Cart</h3>
                <p className='w-full lg:w-[500px] font-satoshi text-[15px] lg:text-[16px]'>Securely complete your order below.</p>
            </div>

            <div className='text-pink'>
                <div className=' w-full h-[75px] lg:h-[100px] flex items-center bg-pink text-lavender font-astrid text-[26px] lg:text-[32px] px-5 lg:px-32'>
                    Customer Information
                </div>
                <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-x-10 lg:gap-x-20 gap-y-3 lg:gap-y-5  px-5 lg:px-32 pt-6 lg:pt-8 pb-10 lg:pb-16'>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='email' className='font-satoshi font-bold text-[14px]'>Email Address</label>
                        <input id='email' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Input Email Address' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='confirmemail' className='font-satoshi font-bold text-[14px]'>Confirm Email Address</label>
                        <input id='confirmemail' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Confirm your email address' />
                    </div>
                </div>

                <div className=' w-full h-[75px] lg:h-[100px] flex items-center bg-pink text-lavender font-astrid text-[26px] lg:text-[32px] px-5 lg:px-32'>
                    Shipping Address
                </div>
                <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-x-10 lg:gap-x-20 gap-y-3 lg:gap-y-5  px-5 lg:px-32 pt-6 lg:pt-8 pb-10 lg:pb-16'>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='firstname' className='font-satoshi font-bold text-[14px]'>First Name</label>
                        <input id='firstname' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Your First Name' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='lastname' className='font-satoshi font-bold text-[14px]'>Last Name</label>
                        <input id='lastname' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Your Last Name' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='number' className='font-satoshi font-bold text-[14px]'>Phone Number</label>
                        <input id='number' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Your Phone Number' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='email' className='font-satoshi font-bold text-[14px]'>Email Address</label>
                        <input id='email' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Input Email Address' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='address1' className='font-satoshi font-bold text-[14px]'>Address 1</label>
                        <input id='address1' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Your Address' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='address2' className='font-satoshi font-bold text-[14px]'>Address 2</label>
                        <input id='address2' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Your Address' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='city' className='font-satoshi font-bold text-[14px]'>City</label>
                        <input id='city' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Your City' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='state' className='font-satoshi font-bold text-[14px]'>State / Province / Region</label>
                        <input id='state' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Your State / Province / Region' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='zip' className='font-satoshi font-bold text-[14px]'>ZIP / Postal Code</label>
                        <input id='zip' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Your ZIP / Postal Code' />
                    </div>

                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='country' className='font-satoshi font-bold text-[14px]'>Country</label>
                        <input id='country' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Your Country' />
                    </div>
                </div>

                <div className=' w-full h-[75px] lg:h-[100px] flex items-center bg-pink text-lavender font-astrid text-[26px] lg:text-[32px] px-5 lg:px-32'>
                    Shipping Method
                </div>
                <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-52 px-5 lg:px-32 pt-6 lg:pt-8 pb-10 lg:pb-16">
                    <h3 className="font-satoshi font-bold text-[14px]">
                        Choose Shipping Method
                    </h3>

                    <div className="space-y-5 lg:space-y-6">
                        <label className="flex items-center gap-4 cursor-pointer">
                            <input
                                type="radio"
                                name="shippingMethod"
                                value="free"
                                className="hidden peer"
                            />
                            <div className="w-3 h-3 rounded-full border-2 border-pink peer-checked:bg-pink"></div>
                            <p className="font-satoshi text-[15px] lg:text-[16px]">
                                Free shipping on orders over $25!
                            </p>
                        </label>

                        <label className="flex items-center gap-4 cursor-pointer">
                            <input
                                type="radio"
                                name="shippingMethod"
                                value="express"
                                className="hidden peer"
                            />
                            <div className="w-3 h-3 rounded-full border-2 border-pink peer-checked:bg-pink"></div>
                            <p className="font-satoshi text-[15px] lg:text-[16px]">
                                Express Shipping (1-2 business days) — $9.99
                            </p>
                        </label>

                        <label className="flex items-center gap-4 cursor-pointer">
                            <input
                                type="radio"
                                name="shippingMethod"
                                value="standard"
                                className="hidden peer"
                            />
                            <div className="w-3 h-3 rounded-full border-2 border-pink peer-checked:bg-pink"></div>
                            <p className="font-satoshi text-[15px] lg:text-[16px]">
                                Standard Shipping (3-5 business days) — $4.99
                            </p>
                        </label>
                    </div>
                </div>


                <div className=' w-full h-[75px] lg:h-[100px] flex items-center bg-pink text-lavender font-astrid text-[26px] lg:text-[32px] px-5 lg:px-32'>
                    Card Information
                </div>
                <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-x-10 lg:gap-x-20 gap-y-3 lg:gap-y-5  px-5 lg:px-32 pt-6 lg:pt-8 pb-10 lg:pb-16'>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='cardholdername' className='font-satoshi font-bold text-[14px]'>Cardholder Name</label>
                        <input id='cardholdername' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Cardholder Name' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='cardnumber' className='font-satoshi font-bold text-[14px]'>Card Number</label>
                        <input id='cardnumber' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Card Number' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='expirationdate' className='font-satoshi font-bold text-[14px]'>Expiration Date</label>
                        <input id='expirationdate' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Expiration Date' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='cvv' className='font-satoshi font-bold text-[14px]'>CVV</label>
                        <input id='cvv' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter CVV' />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='address1' className='font-satoshi font-bold text-[14px]'>Billing Address (if different)</label>
                        <input id='address1' className='w-full h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter Address' />
                    </div>

                </div>

                <div className='w-full justify-center flex gap-4  lg:gap-8 font-montserrat font-medium text-[13px] lg:text-[14px] text-pink pb-12 px-4 lg:px-0'>
                    <Link href='/cart' className='w-full lg:w-[275px] h-[40px] lg:h-[56px]  border-2 border-pink rounded-full flex justify-center items-center '>Return to Cart</Link>
                    <Link href='/' className='w-full lg:w-[275px] h-[40px] lg:h-[56px] text-lavender bg-pink border-2 border-pink rounded-full flex justify-center items-center '>Complete Purchase</Link>
                </div>
            </div>
            <CTA />
        </div>
    )
}

export default page