'use client';
import Scene from '@/three/Scene';
import React, { useEffect } from 'react'
import Lenis from 'lenis';
import Image from 'next/image';
import Hero from '@/components/Hero';
import Banner from '@/components/Banner';
import Products from '@/components/Products';
import Whyus from '@/components/Whyus';
import Ourvalues from '@/components/Ourvalues';
import CTA from '@/components/CTA';
import Spinwheel from '@/components/Spinwheel';

const Page = () => {
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
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