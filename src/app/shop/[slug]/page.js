import Image from 'next/image';
import React from 'react'
import { productData } from '@/utils';
import Banner from '@/components/Banner';
import CTA from '@/components/CTA';

export default async function ProductPage({ params }) {
    const { slug } = await params;

    const product = productData[slug];

    if (!product) {
        return <div className="p-10">Product not found</div>
    }

    return (
        <div className='w-full overflow-hidden'>
            <div className="w-full lg:h-screen relative flex flex-col gap-8 lg:gap-0 lg:flex-row justify-center items-center px-5 lg:px-10 pt-20 lg:pt-14 text-pink">
                <div className='w-full lg:w-1/2 flex flex-col gap-4 lg:items-start relative lg:left-10'>
                    <Image src={product.image} alt="logo" width={1800} height={1800} className='w-full lg:w-[500px] h-auto' />
                    <div className='w-full lg:w-[500px] flex justify-center  gap-4'>
                        <div className='w-[80px] lg:w-[110px] h-[80px] lg:h-[110px] flex justify-center items-center bg-white rounded-lg lg:rounded-xl'>
                            <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[90px] lg:w-[100px] h-auto' />
                        </div>
                        <div className='w-[80px] lg:w-[110px] h-[80px] lg:h-[110px] flex justify-center items-center bg-white rounded-lg lg:rounded-xl'>
                            <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[90px] lg:w-[100px] h-auto' />
                        </div><div className='w-[80px] lg:w-[110px] h-[80px] lg:h-[110px] flex justify-center items-center bg-white rounded-lg lg:rounded-xl'>
                            <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[90px] lg:w-[100px] h-auto' />
                        </div>
                    </div>
                </div>
                <div className='w-full lg:w-1/2 flex flex-col gap-3 lg:gap-6 ' >
                    <p className='font-montserrat font-bold text-[12px] uppercase'>{product.productno}</p>
                    <h3 className='w-full lg:w-[400px] font-astrid text-[36px] lg:text-[56px] leading-10 lg:leading-14'>{product.name}</h3>
                    <div className='font-satoshi text-[24px] leading-5'>★★★★☆</div>
                    <div className='flex gap-2'>
                        <div className='w-[35px] lg:w-[50px] h-[35px] lg:h-[50px] border-4 border-[#B187C6] rounded-full'></div>
                        <div className='w-[35px] lg:w-[50px] h-[35px] lg:h-[50px] border-4 border-[#FCA4A4] rounded-full'></div>
                        <div className='w-[35px] lg:w-[50px] h-[35px] lg:h-[50px] border-4 border-[#FF2F85] rounded-full'></div>
                    </div>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>{product.description}</p>
                    <div>
                        <p className='mb-2 font-montserrat font-bold text-[12px]'>Select Quantity</p>
                        <div className='flex  items-center gap-6 lg:gap-10'>
                            <div className="w-[40px] lg:w-[56px] h-[40px] lg:h-[56px] border-2 border-pink rounded-tl-full rounded-bl-full flex justify-center items-center text-center font-montserrat font-medium text-[20px] text-black">-</div>
                            <div className='text-black font-montserrat font-medium text-[20px]'>1</div>
                            <div className="w-[40px] lg:w-[56px] h-[40px] lg:h-[56px] border-2 border-pink rounded-tr-full rounded-br-full flex justify-center items-center text-center font-montserrat font-medium text-[20px] text-black">+</div>
                        </div>
                    </div>
                    <div className='mt-2 flex gap-4 lg:gap-8 font-montserrat font-medium text-[14px] lg:text-[17px]'>
                        <div className='w-full lg:w-[225px] h-[44px] lg:h-[56px]  border-2 border-pink rounded-full flex justify-center items-center uppercase'>Add to cart</div>
                        <div className='w-full lg:w-[225px] h-[44px] lg:h-[56px] text-lavender bg-pink border-2 border-pink rounded-full flex justify-center items-center uppercase'>Buy now</div>
                    </div>
                </div>
            </div>

            <div className='-rotate-5'>
                <Banner />
            </div>

            <div className='w-full lg:h-screen flex  justify-evenly items-center py-10 lg:py-0'>
                <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[50%] lg:w-[500px] h-auto' />
                <Image src={product.image} alt="logo" width={1800} height={1800} className='w-[50%] lg:w-[500px] h-auto' />
            </div>

            <div className='w-full h-[90vh] lg:h-[75vh] flex flex-col justify-center gap-4 lg:gap-5 text-pink px-5 lg:px-24'>
                <p className='font-montserrat font-bold text-[12px] uppercase'>{product.name}</p>
                <h3 className='w-full lg:w-[500px] font-astrid text-[36px] lg:text-[56px] leading-8 lg:leading-14'>{product.productdetails}</h3>
                <p className='font-satoshi text-[16px] lg:text-[20px]'>{product.description2}</p>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5'>
                    <div className='w-full h-[100px] lg:h-[125px] flex flex-col lg:gap-1 justify-center px-4 lg:px-10  rounded-[16px] lg:rounded-[20px] border-2 border-pink'>
                        <h3 className='font-satoshi font-black text-[14px] lg:text-[16px] uppercase'>Texture</h3>
                        <p className='font-satoshi text-[14px] lg:text-[16px]'>Rich & creamy</p>
                    </div>
                    <div className='w-full h-[100px] lg:h-[125px] flex flex-col lg:gap-1 justify-center px-4 lg:px-10  rounded-[16px] lg:rounded-[20px] border-2 border-pink'>
                        <h3 className='font-satoshi font-black text-[14px] lg:text-[16px] uppercase'>Scent Profile</h3>
                        <p className='font-satoshi text-[14px] lg:text-[16px]'>Calming lavender with a hint of warm vanilla</p>
                    </div>
                    <div className='w-full h-[100px] lg:h-[125px] flex flex-col lg:gap-1 justify-center px-4 lg:px-10  rounded-[16px] lg:rounded-[20px] border-2 border-pink'>
                        <h3 className='font-satoshi font-black text-[14px] lg:text-[16px] uppercase'>Packaging</h3>
                        <p className='font-satoshi text-[14px] lg:text-[16px]'>Sleek, minimal jar with secure lid</p>
                    </div>
                    <div className='w-full h-[100px] lg:h-[125px] flex flex-col lg:gap-1 justify-center px-4 lg:px-10  rounded-[16px] lg:rounded-[20px] border-2 border-pink'>
                        <h3 className='font-satoshi font-black text-[14px] lg:text-[16px] uppercase'>Ideal for</h3>
                        <p className='font-satoshi text-[14px] lg:text-[16px]'>Dry, sensitive, or dull skin</p>
                    </div>
                </div>
            </div>

            {slug !== "vietnamese-hair-vendor-list" && (
                <div className='w-full text-pink space-y-[40px] lg:space-y-[60px] pt-[50px] lg:pt-[100px] pb-[75px] lg:pb-[150px]'>
                    <div className='text-center space-y-[6px] lg:space-y-[10px]'>
                        <p className='font-montserrat font-bold text-[12px] uppercase'>Our values</p>
                        <h3 className='font-astrid text-[46px] lg:text-[84px] leading-12 lg:leading-20'>What’s Inside</h3>
                    </div>
                    <div className='flex justify-start lg:justify-center items-center overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
                        <div className='flex-shrink-0 relative left-8 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[24px] text-center border-2 border-pink px-5 lg:px-[52px] z-0'>
                            <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>✨</h3>
                            <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Shea Butter</h3>
                            <p className='font-satoshi text-[16px] lg:text-[20px]'>
                                Deep hydration & skin repair
                            </p>
                        </div>
                        <div className='flex-shrink-0 relative left-3 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[24px] text-center bg-pink text-lavender border-2 border-pink px-5 lg:px-[52px] z-10'>
                            <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>🌿</h3>
                            <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Aloe Vera</h3>
                            <p className='font-satoshi text-[16px] lg:text-[20px]'>
                                Fights ittitation
                            </p>
                        </div>
                        <div className='flex-shrink-0 relative right-3 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[24px] text-center border-2 border-pink px-5 lg:px-[52px] z-20'>
                            <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>💧</h3>
                            <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Vitamin E</h3>
                            <p className='font-satoshi text-[16px] lg:text-[20px]'>
                                Fights dryness & nourishes
                            </p>
                        </div>
                        <div className='flex-shrink-0 relative right-8 w-[225px] lg:w-[350px] h-[225px] lg:h-[350px] flex flex-col justify-center items-center rounded-[24px] text-center bg-pink text-lavender border-2 border-pink px-5 lg:px-[52px] z-30'>
                            <h3 className='font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24'>🌼</h3>
                            <h3 className='font-astrid text-[32px] lg:text-[40px] leading-10 lg:leading-12'>Essential Oils</h3>
                            <p className='font-satoshi text-[16px] lg:text-[20px]'>
                                Adds natural fragrance and glow
                            </p>
                        </div>

                    </div>
                </div>
            )}

            <CTA />
        </div>
    )
}
