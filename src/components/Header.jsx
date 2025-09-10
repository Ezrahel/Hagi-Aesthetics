'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

const Header = () => {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'About us', path: '/aboutus' },
        { name: 'Faq', path: '/faq' },
        { name: 'Contact us', path: '/contactus' },
    ]

    const getTextColor = () => {
        if (pathname === '/shop' || pathname === '/aboutus' || pathname === '/faq' || pathname === '/contactus' || pathname === '/cart' || pathname === '/checkout') {
            return 'text-lavender'
        }
        return 'text-[#08070885]'
    }

    useEffect(() => {
        setMounted(true)
        const checkMobile = () => setIsMobile(window.innerWidth <= 768)
        checkMobile()

        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Prevent hydration mismatch by not rendering auth components until mounted
    if (!mounted) {
        return (
            <div className='w-full absolute top-0 z-50 py-2 lg:py-4 px-4 lg:px-14'>
                <div className='w-full flex justify-between items-center'>
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="logo"
                            width={100}
                            height={100}
                            className='w-[45px] lg:w-[85px] h-auto'
                        />
                    </Link>
                    <div className={`hidden lg:flex font-montserrat font-bold text-[14px] uppercase gap-[10px] ${getTextColor()}`}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`p-[10px] border-b-2 ${pathname === item.path
                                    ? 'text-pink border-pink'
                                    : 'border-transparent'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full absolute top-0 z-50 py-2 lg:py-4 px-4 lg:px-14'>
            <div className='w-full flex justify-between items-center'>
                <Link href="/">
                    <Image
                        src="/logo.png"
                        alt="logo"
                        width={100}
                        height={100}
                        className='w-[45px] lg:w-[85px] h-auto'
                    />
                </Link>
                <div className={`hidden lg:flex font-montserrat font-bold text-[14px] uppercase gap-[10px] ${getTextColor()}`}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`p-[10px] border-b-2 ${pathname === item.path
                                ? 'text-pink border-pink'
                                : 'border-transparent'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className='flex justify-center items-center gap-5'>
                    <Link href="/cart">
                        <Image
                            src="/icons/cart.svg"
                            alt="cart"
                            width={50}
                            height={50}
                            className='w-[24px] lg:w-[29px] h-auto'
                        />
                    </Link>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="font-montserrat font-bold text-[14px] uppercase text-pink">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                    {isMobile && (
                        <div
                            onClick={() => setMenuOpen(true)}
                            className='flex flex-col gap-[1px] justify-center items-center w-[32px] h-[32px] border-2 border-pink rounded-full cursor-pointer'
                        >
                            <div className='w-4 h-[2.5px] bg-pink rounded-full'></div>
                            <div className='w-4 h-[2.5px] bg-pink rounded-full'></div>
                            <div className='w-4 h-[2.5px] bg-pink rounded-full'></div>
                        </div>
                    )}

                </div>
            </div>
            {isMobile && menuOpen && (
                <div className='w-full h-screen bg-lavender fixed top-0 left-0 flex flex-col items-center justify-center'>
                    <div className='flex flex-col gap-5 font-montserrat font-bold text-[16px] uppercase text-pink text-center'>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={`p-[10px] border-b-2 ${pathname === item.path
                                    ? 'text-pink border-pink'
                                    : 'border-transparent'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div
                        onClick={() => setMenuOpen(false)}
                        className=' absolute top-4 right-4 w-[32px] h-[32px] flex justify-center items-center border-2 border-pink rounded-full  text-pink font-satoshi font-bold cursor-pointer'
                    >
                        <p>x</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Header