'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const Header = () => {
    const pathname = usePathname()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'About us', path: '/aboutus' },
        { name: 'Faq', path: '/faq' },
        { name: 'Contact us', path: '/contactus' },
        { name: 'Book Us', path: '/book-us' },
    ]

    const getTextColor = () => {
        if (pathname === '/shop' || pathname === '/aboutus' || pathname === '/faq' || pathname === '/contactus' || pathname === '/cart' || pathname === '/checkout' || pathname === '/book-us') {
            return 'text-lavender'
        }
        return 'text-[#08070885]'
    }

    const computeCartCount = () => {
        try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem('cart') : null
            const items = raw ? JSON.parse(raw) : []
            const count = Array.isArray(items) ? items.reduce((n, i) => n + (i.qty || 1), 0) : 0
            setCartCount(count)
        } catch {
            setCartCount(0)
        }
    }

    useEffect(() => {
        setMounted(true)
        const checkMobile = () => setIsMobile(window.innerWidth <= 768)
        checkMobile()

        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getUser()
            setUser(data?.user ?? null)
        }
        loadUser()
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => {
            sub.subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (!mounted) return
        computeCartCount()
        const onStorage = (e) => { if (e.key === 'cart') computeCartCount() }
        const onCustom = () => computeCartCount()
        window.addEventListener('storage', onStorage)
        window.addEventListener('cart:update', onCustom)
        return () => {
            window.removeEventListener('storage', onStorage)
            window.removeEventListener('cart:update', onCustom)
        }
    }, [mounted])

    const requestSignOut = () => setShowLogoutConfirm(true)
    const cancelSignOut = () => setShowLogoutConfirm(false)
    const confirmSignOut = async () => {
        await supabase.auth.signOut()
        setShowLogoutConfirm(false)
        router.push('/')
    }

    const displayName = user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email

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
                    <div className='flex justify-center items-center gap-5'>
                        <Link href="/cart" className='relative'>
                            <Image
                                src="/icons/cart.svg"
                                alt="cart"
                                width={50}
                                height={50}
                                className='w-[24px] lg:w-[29px] h-auto'
                            />
                            {cartCount > 0 && (
                                <span className='absolute -top-2 -right-2 bg-pink text-white text-[10px] font-bold rounded-full px-1.5 py-0.5'>{cartCount}</span>
                            )}
                        </Link>
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
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
                <nav className="hidden lg:flex font-montserrat font-bold text-[14px] uppercase gap-[10px]" style={{ opacity: 1, visibility: 'visible' }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            prefetch={true}
                            className={`p-[10px] border-b-2 transition-colors duration-200 ${pathname === item.path
                                ? 'text-pink border-pink'
                                : 'text-black border-transparent hover:text-pink/80'
                                }`}
                            style={{ opacity: 1, visibility: 'visible', display: 'block' }}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className='flex justify-center items-center gap-5'>
                    <Link href="/cart" className='relative'>
                        <Image
                            src="/icons/cart.svg"
                            alt="cart"
                            width={50}
                            height={50}
                            className='w-[24px] lg:w-[29px] h-auto'
                        />
                        {mounted && cartCount > 0 && (
                            <span className='absolute -top-2 -right-2 bg-pink text-white text-[10px] font-bold rounded-full px-1.5 py-0.5'>{cartCount}</span>
                        )}
                    </Link>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-700">{displayName}</span>
                            <button onClick={requestSignOut} className="font-montserrat font-bold text-[14px] uppercase text-pink hover:text-pink/80 transition-colors">Sign Out</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.push('/sign-in')} className="font-montserrat font-bold text-[14px] uppercase text-pink hover:text-pink/80 transition-colors">Sign In</button>
                            <button onClick={() => router.push('/sign-up')} className="font-montserrat font-bold text-[14px] uppercase bg-pink text-white px-4 py-2 hover:bg-pink/90 transition-colors">Sign Up</button>
                        </div>
                    )}
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

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-2">Confirm Logout</h2>
                        <p className="text-sm text-gray-600 mb-4">Are you sure you want to sign out?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={cancelSignOut} className="px-4 py-2 border rounded">Cancel</button>
                            <button onClick={confirmSignOut} className="px-4 py-2 bg-pink text-white rounded">Sign Out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Header
