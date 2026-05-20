import React from 'react'
import Title from '../components/Title'
import NewsletterBox from '../components/NewsletterBox'
import { assets } from '../assets/assets'
const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img src={assets.about_img} alt="About Us" className='w-full md:max-w-[450px]'/>
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
        <p>VenZara was born out of a passion for innovation and a desire to revolutionize the way people shop online. We started with a simple idea: to provide a platform where customers can easily discover, explore, and purchase the latest trends in fashion and lifestyle products from the comfort of their homes.</p>
        <p>Since our inception, we have worked tirelessly to curate a diverse collection of high-quality products that cater to every taste and preference. From the latest fashion staples to everyday essentials, we ensure that every item on VENZARA meets our rigorous standards of quality and style.</p>
        <b className='text-gray-800'>Our Mission</b>
        <p>Our mission is to empower customers with a seamless and enjoyable shopping experience, while continuously innovating to stay ahead of the curve in the ever-evolving e-commerce landscape.</p>
        </div>
      </div>
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>We meticulously select and vet each product to ensure it meets our high standards of durability and design.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>With our user-friendly interface and hassle-free ordering process, shopping has never been easier.</p>
        </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className='text-gray-600'>Our team of dedicated professionals is here to assist you every step of the way, ensuring your satisfaction is our top priority.</p>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About