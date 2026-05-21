// Product.jsx

import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import RelatedProducts from '../components/RelatedProducts'
import WishlistButton from '../components/WishlistButton'

const Product = () => {

  const { productId } = useParams()

  const { products, currency, addToCart, backendUrl } =
    useContext(ShopContext)

  const [productData, setProductData] = useState(null)

  const [image, setImage] = useState('')

  const [size, setSize] = useState('')

  const [activeTab, setActiveTab] = useState('description')

  // ---------------- REVIEWS STATES ----------------

  const [reviews, setReviews] = useState([])

  const [reviewName, setReviewName] = useState('')

  const [reviewText, setReviewText] = useState('')

  const [reviewRating, setReviewRating] = useState(5)

  const [editingId, setEditingId] = useState(null)

  // ---------------- FETCH PRODUCT ----------------

  const fetchProductData = () => {

    const item = products.find(
      (p) => String(p._id) === String(productId)
    )

    if (item) {

      setProductData(item)

      setImage(item.image?.[0] || '')

    } else {

      setProductData(null)

    }
  }

  // ---------------- FETCH REVIEWS ----------------

  const fetchReviews = async () => {

    try {

      const response = await axios.get(
        `${backendUrl}/api/review/${productId}`
      )

      if (response.data.success) {

        setReviews(response.data.reviews)

      }

    } catch (error) {

      console.log(error)

    }
  }

  // ---------------- ADD REVIEW ----------------

  const addReview = async () => {

    try {

      if (!reviewName || !reviewText) {

        alert("Please fill all fields")

        return
      }

      const reviewData = {

        productId,

        userName: reviewName,

        rating: reviewRating,

        reviewText

      }

      await axios.post(
        `${backendUrl}/api/review/add`,
        reviewData
      )

      fetchReviews()

      setReviewName('')

      setReviewText('')

      setReviewRating(5)

    } catch (error) {

      console.log(error)

    }
  }

  // ---------------- DELETE REVIEW ----------------

  const deleteReview = async (id) => {

    try {

      await axios.delete(
        `${backendUrl}/api/review/delete/${id}`
      )

      fetchReviews()

    } catch (error) {

      console.log(error)

    }
  }

  // ---------------- EDIT REVIEW ----------------

  const editReview = (review) => {

    setEditingId(review._id)

    setReviewName(review.userName)

    setReviewText(review.reviewText)

    setReviewRating(review.rating)
  }

  // ---------------- UPDATE REVIEW ----------------

  const updateReview = async () => {

    try {

      const updatedData = {

        userName: reviewName,

        rating: reviewRating,

        reviewText

      }

      await axios.put(
        `${backendUrl}/api/review/update/${editingId}`,
        updatedData
      )

      fetchReviews()

      setEditingId(null)

      setReviewName('')

      setReviewText('')

      setReviewRating(5)

    } catch (error) {

      console.log(error)

    }
  }

  // ---------------- USE EFFECTS ----------------

  useEffect(() => {

    if (products.length > 0) {

      fetchProductData()

    }

  }, [productId, products])

  useEffect(() => {

    fetchReviews()

  }, [productId])

  return productData ? (

    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>

      {/* ---------------- PRODUCT DATA ---------------- */}

      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/* ---------------- PRODUCT IMAGES ---------------- */}

        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>

          {/* SIDE IMAGES */}

          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>

            {
              productData?.image?.map((item, index) => (

                <img
                  onClick={() => setImage(item)}
                  src={item}
                  key={index}
                  className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border'
                  alt=""
                />

              ))
            }

          </div>

          {/* MAIN IMAGE */}

          <div className='w-full sm:w-[80%]'>

            <img
              className='w-full h-auto object-cover rounded'
              src={image || productData?.image?.[0]}
              alt={productData?.name}
            />

          </div>

        </div>

        {/* ---------------- PRODUCT INFO ---------------- */}

        <div className='flex-1'>

          {/* PRODUCT NAME */}

          <h1 className='font-medium text-2xl mt-2'>
            {productData.name}
          </h1>

          {/* RATINGS */}

          <div className='flex items-center gap-1 mt-2'>

            <img src={assets.star_icon} alt="" className='w-3' />
            <img src={assets.star_icon} alt="" className='w-3' />
            <img src={assets.star_icon} alt="" className='w-3' />
            <img src={assets.star_icon} alt="" className='w-3' />
            <img src={assets.star_dull_icon} alt="" className='w-3' />

            <p className='pl-2'>
              ({reviews.length})
            </p>

          </div>

          {/* PRICE */}

          <p className='mt-5 text-3xl font-medium'>
            {currency}{productData.price}
          </p>

          {/* DESCRIPTION */}

          <p className='mt-5 text-gray-500 md:w-4/5'>
            {productData.description}
          </p>

          {/* SIZE SECTION */}

          <div className='flex flex-col gap-4 my-8'>

            <p>Select Size</p>

            <div className='flex gap-2 flex-wrap'>

              {
                productData?.sizes?.map((item, index) => (

                  <button
                    key={index}
                    onClick={() => setSize(item)}
                    className={`border py-2 px-4 bg-gray-100
                    ${item === size ? 'border-orange-500' : ''}`}
                  >
                    {item}
                  </button>

                ))
              }

            </div>

          </div>

          {/* ADD TO CART */}

          <div className='flex flex-col sm:flex-row gap-3'>

            <button
              onClick={() => addToCart(productData._id, size)}
              className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
            >
              ADD TO CART
            </button>

            <WishlistButton product={productData} />

          </div>

          <hr className='mt-8 sm:w-4/5' />

          {/* PRODUCT INFO */}

          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>

            <p>100% Original Product.</p>

            <p>Cash on delivery available.</p>

            <p>Easy return and exchange within 7 days.</p>

          </div>

        </div>

      </div>

      {/* ---------------- DESCRIPTION & REVIEWS ---------------- */}

      <div className='mt-20'>

        {/* TABS */}

        <div className='flex'>

          <button
            onClick={() => setActiveTab('description')}
            className={`border px-5 py-3 text-sm font-medium
            ${activeTab === 'description'
                ? 'bg-black text-white'
                : ''
              }`}
          >
            Description
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`border px-5 py-3 text-sm font-medium
            ${activeTab === 'reviews'
                ? 'bg-black text-white'
                : ''
              }`}
          >
            Reviews ({reviews.length})
          </button>

        </div>

        {/* TAB CONTENT */}

        <div className='border px-6 py-6'>

          {
            activeTab === 'description' ? (

              <div className='text-gray-500 flex flex-col gap-4'>

                <p>
                  {productData.description}
                </p>

                <p>
                  Crafted with premium quality materials
                  for durability, comfort and modern style.
                </p>

              </div>

            ) : (

              <div className='flex flex-col gap-5'>

                {/* REVIEW FORM */}

                <div className='border p-4 rounded'>

                  <h3 className='text-lg font-medium mb-4'>

                    {
                      editingId
                        ? "Edit Review"
                        : "Write a Review"
                    }

                  </h3>

                  {/* NAME */}

                  <input
                    type="text"
                    placeholder='Your Name'
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className='border p-2 w-full mb-3 outline-none'
                  />

                  {/* RATING */}

                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className='border p-2 w-full mb-3 outline-none'
                  >

                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>

                  </select>

                  {/* REVIEW TEXT */}

                  <textarea
                    rows={4}
                    placeholder='Write your review...'
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className='border p-2 w-full mb-3 outline-none'
                  />

                  {/* BUTTON */}

                  <button
                    onClick={
                      editingId
                        ? updateReview
                        : addReview
                    }
                    className='bg-black text-white px-5 py-2'
                  >

                    {
                      editingId
                        ? "Update Review"
                        : "Submit Review"
                    }

                  </button>

                </div>

                {/* REVIEWS LIST */}

                {
                  reviews.map((review, index) => (

                    <div
                      key={index}
                      className='border-b pb-4'
                    >

                      <div className='flex items-center gap-2'>

                        <p className='font-medium text-black'>
                          {review.userName}
                        </p>

                        <p>
                          {"⭐".repeat(review.rating)}
                        </p>

                      </div>

                      <p className='mt-2 text-gray-500'>
                        {review.reviewText}
                      </p>

                      {/* ACTION BUTTONS */}

                      <div className='flex gap-4 mt-3'>

                        <button
                          onClick={() => editReview(review)}
                          className='text-blue-500'
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteReview(review._id)}
                          className='text-red-500'
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  ))
                }

              </div>

            )
          }

        </div>

      </div>

      {/* ---------------- RELATED PRODUCTS ---------------- */}

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />

    </div>

  ) : (

    <div className='text-center py-20 text-gray-500'>
      Loading Product...
    </div>

  )
}

export default Product