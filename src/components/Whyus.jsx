import React from 'react'

const WhyUs = () => {
    const items = [
        { 
            title: "Affordable", 
            description: "Very Affordable, not pricey!" 
        },
        { 
            title: "Digital", 
            description: "PDF File" 
        },
        { 
            title: "Vietnamese", 
            description: "Vietnamese hair vendor list" 
        },
        { 
            title: "Raw Hair", 
            description: "High quality raw hair" 
        },
    ];

    return (
        <div className='w-full flex flex-col gap-6 lg:gap-8 text-pink py-10 px-5 lg:px-24'>
            {/* What You'll Get Section */}
            <div className='w-full flex flex-col gap-4 lg:gap-5'>
                <h3 className='font-astrid text-[28px] lg:text-[40px] leading-8 lg:leading-10'>
                    What You'll Get:
                </h3>
                <div className='font-satoshi text-[16px] lg:text-[18px] leading-6 lg:leading-7'>
                    <p className='mb-3'>A downloadable PDF with:</p>
                    <ul className='list-none space-y-2 lg:space-y-3'>
                        <li className='flex items-start gap-2'>
                            <span className='text-[18px] lg:text-[20px]'>🏭</span>
                            <span>Direct contact info of verified Hair vendors</span>
                        </li>
                        <li className='flex items-start gap-2'>
                            <span className='text-[18px] lg:text-[20px]'>🌐</span>
                            <span>Links to their websites and social pages</span>
                        </li>
                        <li className='flex items-start gap-2'>
                            <span className='text-[18px] lg:text-[20px]'>📦</span>
                            <span>Minimum order quantities & pricing info</span>
                        </li>
                        <li className='flex items-start gap-2'>
                            <span className='text-[18px] lg:text-[20px]'>🚛</span>
                            <span>Shipping/fulfillment details (US & international)</span>
                        </li>
                        <li className='flex items-start gap-2'>
                            <span className='text-[18px] lg:text-[20px]'>💬</span>
                            <span>Tips on vendor communication & negotiation</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Items Grid */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5'>
                {items.map((item, index) => (
                    <div 
                        key={index} 
                        className='w-full h-[100px] lg:h-[125px] flex flex-col lg:gap-1 justify-center px-4 lg:px-10 rounded-[16px] lg:rounded-[20px] border-2 border-pink'
                    >
                        <h3 className='font-satoshi font-black text-[14px] lg:text-[16px] uppercase'>
                            {item.title}
                        </h3>
                        <p className='font-satoshi text-[14px] lg:text-[16px]'>
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WhyUs
