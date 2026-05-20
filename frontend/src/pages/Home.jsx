import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'

const Home = () => {
  return (
    <div className='overflow-hidden'>

      {/* Hero Section */}
      <Hero />

      {/* Latest Collection */}
      <section className='px-4 sm:px-8 md:px-12 lg:px-16'>
        <LatestCollection />
      </section>

      {/* Best Seller */}
      <section className='px-4 sm:px-8 md:px-12 lg:px-16'>
        <BestSeller />
      </section>

      {/* Policies */}
      <section className='bg-gray-50 py-10 mt-10'>
        <OurPolicy />
      </section>

      {/* Newsletter */}
      <section className='py-14'>
        <NewsletterBox />
      </section>

    </div>
  )
}

export default Home