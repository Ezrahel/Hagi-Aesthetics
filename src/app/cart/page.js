import CTA from '@/components/CTA'
import React from 'react'
import CartItems from './components/CartItems'
import Hero from './components/Hero'
import Link from 'next/link'
const page = () => {
    return (
        <div className=''>
            <Hero />
            <CartItems />
            <div className='w-full  flex flex-col gap-10 lg:gap-16 justify-center items-center py-10 lg:py-24'>
                <div className='w-full justify-center flex gap-4  lg:gap-8 font-montserrat font-medium text-[12px] lg:text-[14px] text-pink pb-12 px-4 lg:px-0'>
                    <Link href='/shop' className='w-full lg:w-[275px] h-[40px] lg:h-[56px]  border-2 border-pink rounded-full flex justify-center items-center'>Continue Shopping</Link>
                    <Link href='/checkout' className='w-full lg:w-[275px] h-[40px] lg:h-[56px] text-lavender bg-pink border-2 border-pink rounded-full flex justify-center items-center'>Proceed to Checkout</Link>
                </div>


                <div className='w-full flex flex-col gap-12 lg:gap-0 lg:flex-row text-pink px-5 lg:px-24'>
                    <div className='w-full flex flex-col gap-5 lg:gap-5 '>
                        <h3 className='font-astrid text-[22px] lg:text-[24px]'>Coupon Code</h3>
                        <input className='w-full lg:w-[400px] h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter your coupon code' />
                        <button className='w-[150px] lg:w-[250px] h-[46px] lg:h-[52px] text-lavender bg-pink font-montserrat font-medium text-[14px] lg:text-[15px] rounded-full flex justify-center items-center cursor-pointer'>Apply Coupon</button>
                    </div>

                    <div className='w-full flex flex-col gap-5 lg:gap-5 '>
                        <h3 className='font-astrid text-[22px] lg:text-[24px]'>Calculate Shipping</h3>
                        <div className='flex flex-col gap-2'>
                            <label htmlFor='country' className='font-satoshi font-bold text-[14px]'>Country</label>
                            <input id='country' className='w-full lg:w-[400px] h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter your Country' />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label htmlFor='state' className='font-satoshi font-bold text-[14px]'>State / Province</label>
                            <input id='state' className='w-full lg:w-[400px] h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter your State / Province' />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label htmlFor='zipcode' className='font-satoshi font-bold text-[14px]'>Zip Code</label>
                            <input id='zipcode' className='w-full lg:w-[400px] h-[52px] border border-[#00000050] font-satoshi italic text-[14px]  px-4 outline-none' placeholder='Enter your zip code' />
                        </div>
                    </div>

                    <div className='w-full flex flex-col gap-5 lg:gap-10 '>
                        <h3 className='font-astrid text-[22px] lg:text-[24px]'>Cart Total</h3>
                        <div className='space-y-2 lg:space-y-4 font-satoshi font-bold text-[14px]'>
                            <div className='w-full flex py-3 border-b border-[#00000050]'>
                                <p className='w-[50%]'>Cart Subtotal</p>
                                <p className='w-[50%]'>989.57</p>
                            </div>
                            <div className="w-full flex justify-evenly py-3 border-b border-[#00000050]">
                                <p className="w-[50%]">Shipping and Handling</p>

                                <div className="w-[50%] space-y-3 lg:space-y-4">
                                    <label className="flex items-center gap-4 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="flat"
                                            className="hidden peer"
                                        />
                                        <div className="w-3 h-3 rounded-full border-2 border-pink peer-checked:bg-pink"></div>
                                        <span>Flat Rate : $40</span>
                                    </label>

                                    <label className="flex items-center gap-4 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="free"
                                            className="hidden peer"
                                        />
                                        <div className="w-3 h-3 rounded-full border-2 border-pink peer-checked:bg-pink"></div>
                                        <span>Free Shipping</span>
                                    </label>

                                    <label className="flex items-center gap-4 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="international"
                                            className="hidden peer"
                                        />
                                        <div className="w-3 h-3 rounded-full border-2 border-pink peer-checked:bg-pink"></div>
                                        <span>International Shipping</span>
                                    </label>

                                    <label className="flex items-center gap-4 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="local-delivery"
                                            className="hidden peer"
                                        />
                                        <div className="w-3 h-3 rounded-full border-2 border-pink peer-checked:bg-pink"></div>
                                        <span>Local Delivery: $40</span>
                                    </label>

                                    <label className="flex items-center gap-4 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="pickup"
                                            className="hidden peer"
                                        />
                                        <div className="w-3 h-3 rounded-full border-2 border-pink peer-checked:bg-pink"></div>
                                        <span>Local Pickup</span>
                                    </label>
                                </div>
                            </div>


                            <div className='w-full flex justify-evenly py-3 border-b border-[#00000050]'>
                                <p className='w-[50%]'>Order Total</p>
                                <p className='w-[50%]'>1989.57</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CTA />
        </div>
    )
}

export default page