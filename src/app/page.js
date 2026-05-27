import Block1 from '@/content/home/Block1'
import Block10 from '@/content/home/Block10'
import Block11 from '@/content/home/Block11'
import Block2 from '@/content/home/Block2'
import Block3 from '@/content/home/Block3'
import Block4 from '@/content/home/Block4'
import Block5 from '@/content/home/Block5'
import Block6 from '@/content/home/Block6'
import Block7 from '@/content/home/Block7'
import Block8 from '@/content/home/Block8'
import Block9 from '@/content/home/Block9'
import HeroSection from '@/content/home/HeroSection'
import React from 'react'
// import "./globals.css";

const page = () => {
  return (
    <div className=''>
      <HeroSection/>
      <Block1/>
      <Block2/>
      <Block3/>
      <Block4/>
      <Block5/>
      <Block6/>
      <Block7/>
      {/* <Block8/> */}
      <Block9/>
      <Block10/>
      <Block11/>
    </div>
  )
}

export default page
