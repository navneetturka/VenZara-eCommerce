import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import axios from "axios";
import { toast } from "react-toastify";

const CartTotal = () => {

  const {
    currency,
    getCartAmount,
    backendUrl,
    discount,
    setDiscount,
    couponCode,
    setCouponCode,
    shippingFee
  } = useContext(ShopContext);

  const subtotal = getCartAmount();

  // ───── TOTAL CALCULATION ─────
  const total =
    subtotal === 0
      ? 0
      : subtotal + shippingFee - discount;

  // ───── APPLY COUPON ─────
  const applyCoupon = async () => {

    if (!couponCode) {
      toast.error("Please enter coupon code");
      return;
    }

    try {

      const response = await axios.post(
        `${backendUrl}/api/newsletter/verify-coupon`,
        { couponCode }
      );

      if (response.data.success) {

        const percent = response.data.discountPercent;

        const discountValue =
          (subtotal * percent) / 100;

        setDiscount(discountValue);

        toast.success(`🎉 ${percent}% Discount Applied`);

      } else {

        setDiscount(0);
        toast.error(response.data.message);

      }

    } catch (error) {

      console.log(error);
      setDiscount(0);

      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  return (
    <div className='w-full'>

      {/* TITLE */}
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      {/* COUPON SECTION */}
      <div className='flex gap-2 my-4'>

        <input
          type="text"
          placeholder='Enter Coupon Code'
          value={couponCode}
          onChange={(e) =>
            setCouponCode(e.target.value.toUpperCase())
          }
          className='border px-3 py-2 w-full outline-none'
        />

        <button
          type='button'
          onClick={applyCoupon}
          className='bg-black text-white px-5 py-2 hover:bg-gray-800 transition'
        >
          Apply
        </button>

      </div>

      {/* TOTALS */}
      <div className='flex flex-col gap-2 mt-2 text-sm'>

        {/* SUBTOTAL */}
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{currency}{subtotal.toFixed(2)}</p>
        </div>

        <hr />

        {/* SHIPPING */}
        <div className='flex justify-between'>
          <p>Shipping Fee</p>
          <p>{currency}{shippingFee.toFixed(2)}</p>
        </div>

        <hr />

        {/* DISCOUNT */}
        {discount > 0 && (
          <>
            <div className='flex justify-between text-green-600 font-medium'>
              <p>Discount</p>
              <p>- {currency}{discount.toFixed(2)}</p>
            </div>
            <hr />
          </>
        )}

        {/* TOTAL */}
        <div className='flex justify-between text-base'>
          <b>Total</b>
          <b>{currency}{total.toFixed(2)}</b>
        </div>

      </div>

    </div>
  )
}

export default CartTotal