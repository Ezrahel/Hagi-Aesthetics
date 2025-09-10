import Image from "next/image";
import React from "react";
import CTA from "./CTA";
import { Faqs } from "@/utils";

const FAQCard = ({ question, answer }) => (
    <div className="border-2 border-pink rounded-[16px] lg:rounded-[20px] px-3 py-3 space-y-2">
        <h3 className="uppercase font-satoshi font-black text-[15px] lg:text-[18px]">
            {question}
        </h3>
        <p className="font-satoshi text-[16px] lg:text-[20px]">{answer}</p>
    </div>
);

const FAQSection = ({ title, faqs }) => (
    <div>
        <div className="w-full h-16 lg:h-24 flex items-center bg-pink text-lavender font-astrid text-[20px] lg:text-[28px] px-5 lg:px-24">
            {title}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-5 lg:px-24 py-10 lg:py-16">
            {faqs.map((faq, i) => (
                <FAQCard key={i} question={faq.q} answer={faq.a} />
            ))}
        </div>
    </div>
);

const Page = () => {
    return (
        <div>
            <div className="w-full h-[100vh] relative text-pink px-5 lg:px-24">
                <Image
                    src="/bgs/faq1.webp"
                    alt="faq"
                    width={2600}
                    height={1600}
                    className="absolute left-0 top-0 w-full h-screen object-cover"
                />
                <div className="w-full h-screen flex justify-center items-center gap-4 lg:gap-5 text-center flex-col relative z-10">
                    <p className="uppercase font-montserrat font-bold text-[12px]">
                        Indulge in the Luxury of Soft Skin.
                    </p>
                    <h1 className="font-astrid text-[50px] lg:text-[90px] leading-12 lg:leading-24">
                        Frequently <br /> Asked Questions
                    </h1>
                    <p className="font-satoshi text-[16px] lg:text-[20px]">
                        Your Skin Deserves Clarity. Here are answers to questions we get the most.
                    </p>
                </div>
            </div>

            <div className="text-pink">
                {Faqs.map((section, i) => (
                    <FAQSection key={i} title={section.title} faqs={section.faqs} />
                ))}
            </div>

            <CTA />
        </div>
    );
};

export default Page;
