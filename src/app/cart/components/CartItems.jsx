import Image from "next/image";
import React from "react";

const products = [
    {
        id: 1,
        name: "Suck It Up Body Butter",
        description:
            "A deeply moisturizing body butter that soothes and softens your skin. Infused with calming Lavender and creamy Vanilla for a spa-like experience.",
        price: 7.99,
        quantity: 1,
        image: "/product2.png",
    },
    {
        id: 2,
        name: "Suck It Up Body Butter",
        description:
            "A deeply moisturizing body butter that soothes and softens your skin. Infused with calming Lavender and creamy Vanilla for a spa-like experience.",
        price: 7.99,
        quantity: 2,
        image: "/product2.png",
    },
    {
        id: 3,
        name: "Suck It Up Body Butter",
        description:
            "A deeply moisturizing body butter that soothes and softens your skin. Infused with calming Lavender and creamy Vanilla for a spa-like experience.",
        price: 7.99,
        quantity: 1,
        image: "/product2.png",
    },
];

const CartRow = ({ product }) => (
    <div className="w-full pt-10 text-pink px-5 lg:px-24">
        <div className="w-full flex flex-col gap-4 lg:gap-0 lg:flex-row justify-between items-center">
            <div className="w-full lg:w-[35vw] flex gap-2 lg:gap-6">
                <div className="w-[30%] lg:w-[25%]">
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={1800}
                        height={1800}
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="w-[70%] lg:w-[75%] flex flex-col justify-center">
                    <h3 className="font-astrid text-[18px] lg:text-[20px]">
                        {product.name}
                    </h3>
                    <p className="font-montserrat line-clamp-3 text-[13px] lg:text-[14px]">
                        {product.description}
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-[65vw] flex gap-2 justify-evenly items-center">
                <h3 className="font-montserrat font-bold text-[15px] lg:text-[16px]">
                    Price: ${product.price.toFixed(2)}
                </h3>

                <div className="flex items-center gap-3 lg:gap-10">
                    <button className="w-[20px] lg:w-[28px] h-[20px] lg:h-[28px] border-[1.5px] border-pink rounded-l-full flex justify-center items-center text-black font-montserrat font-medium text-[18px]">
                        -
                    </button>
                    <span className="text-black font-montserrat font-medium text-[16px]">
                        {product.quantity}
                    </span>
                    <button className="w-[20px] lg:w-[28px] h-[20px] lg:h-[28px] border-[1.5px] border-pink rounded-r-full flex justify-center items-center text-black font-montserrat font-medium text-[18px]">
                        +
                    </button>
                </div>

                <h3 className="font-montserrat font-bold text-[15px] lg:text-[16px]">
                    Total: ${(product.price * product.quantity).toFixed(2)}
                </h3>

                <button className="w-[20px] h-[20px] flex justify-center items-center rounded-full bg-black text-lavender font-satoshi font-semibold text-[10px]">
                    X
                </button>
            </div>
        </div>
        <div className="w-full border-b border-[#00000050] mt-10"></div>
    </div>
);

const CartItems = () => {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="w-full h-[70px] lg:h-[84px] bg-pink">
                <div className="w-full h-full flex flex-col gap-1 lg:gap-0 lg:flex-row justify-center lg:justify-between items-center px-5 lg:px-24 text-lavender font-montserrat font-bold text-[14px] lg:text-[16px] uppercase">
                    <div className="w-full lg:w-[35vw] flex justify-center">
                        <h3>Product</h3>
                    </div>
                    <div className="w-full lg:w-[65vw] flex justify-between lg:justify-evenly">
                        <h3>Price</h3>
                        <h3>Quantity</h3>
                        <h3>Total</h3>
                        <h3 className="hidden lg:block"></h3>
                    </div>
                </div>
            </div>

            {products.map((product) => (
                <CartRow key={product.id} product={product} />
            ))}
        </div>
    );
};

export default CartItems;
