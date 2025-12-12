'use client';
import React, { useEffect } from 'react'
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Hero from '@/components/Hero';
import Banner from '@/components/Banner';

// Dynamic imports for heavy components - loaded only when needed
const Scene = dynamic(() => import('@/three/Scene'), { 
  ssr: false, 
  loading: () => <div className='hidden lg:block w-full h-[60vh] lg:h-screen fixed top-0' />
});

const Products = dynamic(() => import('@/components/Products'));
const Whyus = dynamic(() => import('@/components/Whyus'));
const Ourvalues = dynamic(() => import('@/components/Ourvalues'));
const CTA = dynamic(() => import('@/components/CTA'));
const Spinwheel = dynamic(() => import('@/components/Spinwheel'), { ssr: false });

const Page = () => {
  useEffect(() => {
    // Lazy load Lenis to reduce initial bundle size
    let lenis = null;
    let rafId = null;
    
    const initLenis = async () => {
      const Lenis = (await import('lenis')).default;
      lenis = new Lenis();
      
    const raf = (time) => {
      lenis.raf(time);
        rafId = requestAnimationFrame(raf);
    };
      rafId = requestAnimationFrame(raf);
    };
    
    initLenis();
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);

  return (
    <div className='overflow-hidden'>
      <Hero />
      <Banner />
      <div className='w-full h-[100dvh] lg:h-[1600px] absolute top-0'>
        <Image src="/bgs/Home1.webp" alt="bg" width={1000} height={1000} className='w-full h-full object-cover lg:h-[1600px] relative lg:bottom-[300px]' />
      </div>
      <div id="scrollarea" className='hidden lg:flex h-[2500px] lg:h-[5000px] bg-transparent  justify-center items-center' />
      <Scene />
      <Products />
      <Whyus />
      <Ourvalues />
      <Spinwheel />
      <CTA />
    </div>
  )
}

export default Page