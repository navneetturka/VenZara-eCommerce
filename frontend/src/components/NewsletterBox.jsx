import React, { useContext, useState } from 'react'
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const NewsletterBox = () => {

  const { backendUrl, token } = useContext(ShopContext);

  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {

    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {

      setLoading(true);

      const response = await axios.post(
        `${backendUrl}/api/newsletter/subscribe`,
        {},
        {
          headers: {
            token,
          },
        }
      );

      if (response.data.success) {

        toast.success("🎉 Coupon sent to your email");

      } else {

        toast.error(response.data.message);

      }

    } catch (error) {

      toast.error(
        error.response?.data?.message || "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className='text-center py-16 px-4'>

      <p className='text-3xl font-semibold text-gray-800'>
        Subscribe now & get 20% OFF
      </p>

      <p className='text-gray-500 mt-3 max-w-xl mx-auto'>
        Join the VenZara family and unlock exclusive discounts,
        special offers, and early access to new collections.
      </p>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className='bg-black hover:bg-gray-800 transition text-white px-8 py-4 mt-8 rounded-md disabled:opacity-50'
      >

        {
          loading
            ? "Please Wait..."
            : "Claim 20% Coupon"
        }

      </button>

      <p className='text-xs text-gray-400 mt-4'>
        * Coupon available only for registered users and valid one time.
      </p>

    </div>
  )
}

export default NewsletterBox