import React from 'react'

const Mission = () => {
    return (
        <div className='w-full space-y-[50px] lg:space-y-[100px] py-[50px] lg:py-[100px] px-5 lg:px-24 text-pink'>
            <div className='w-full flex flex-col lg:flex-row'>
                <div className='w-full lg:w-1/2 flex flex-col '>
                    <div className='space-y-[10px]'>
                        <p className='font-montserrat font-bold text-[12px] uppercase'>our story</p>
                        <h3 className='font-astrid text-[46px] lg:text-[84px] leading-12 lg:leading-20'>Born from <br />Ritual, Rooted <br />in Care</h3>
                    </div>
                </div>
                <div className='w-full lg:w-1/2 flex flex-col gap-4 lg:gap-6 justify-start items-center mt-4 lg:mt-0'>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        At Hagi Aesthetics, we believe skincare is more than routine — it's a daily ritual of love, healing, and restoration. Our founder created this line with the intention to infuse softness into your everyday life.
                    </p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        What began as a personal journey towards self-acceptance and confidence grew into a brand committed to helping others feel seen, beautiful, and bold in their skin.
                    </p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        Each product is made with purpose — blending botanical ingredients, rich textures, and mood-lifting scents that elevate your self-care experience.
                    </p>
                </div>
            </div>
            <div className='w-full flex flex-col-reverse lg:flex-row'>
                <div className='w-full lg:w-1/2 flex flex-col gap-4 lg:gap-6 justify-start text-end lg:text-start items-center mt-4 lg:mt-0'>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        At Hagi Aesthetics, our mission is to create products that go beyond skincare — we’re here to build moments of self-appreciation.
                    </p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        We are intentional about every ingredient, every formula, and every scent we release. From rich textures to therapeutic aromas, our products are made to transform ordinary routines into sacred rituals.
                    </p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        We believe in clean beauty — no toxins, no harsh chemicals, no compromise. Our body butters are crafted with integrity, blending nature’s finest ingredients with a touch of elegance and soul.
                    </p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        But more than that, we believe in emotional beauty — the kind that radiates from self-confidence, rest, peace, and love. Our goal is to give you the tools to feel whole in your skin, to fall in love with your reflection, and to make skincare your favorite part of the day.
                    </p>
                    <p className='font-satoshi text-[16px] lg:text-[20px]'>
                        Because healing starts from within. And glowing skin? That’s just the bonus.
                    </p>
                </div>
                <div className='w-full lg:w-1/2 flex flex-col items-end text-end  gap-[10px]'>
                    <div className='space-y-[10px]'>
                        <p className='font-montserrat font-bold text-[12px] uppercase'>Our mission</p>
                        <h3 className='font-astrid text-[46px] lg:text-[84px] leading-12 lg:leading-20'>Our Mission:  <br />Beauty That <br />Heals </h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Mission