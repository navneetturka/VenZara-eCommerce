import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from "react-toastify";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {

  const [currentState, setCurrentState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { backendUrl, login, register, googleLogin } = useContext(ShopContext)

  const OnSubmitHandler = async (event) => {
  event.preventDefault()
if (currentState !== "Login" && password.length < 8) {
  toast.error("Password must be at least 8 characters")
  return
}
  setLoading(true)

  try {
    if (currentState === 'Login') {
      await login(email, password)
    } else {
      await register(name, email, password)
    }
  } catch (error) {
    console.log(error)
  }

  setLoading(false)
}

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Arre bhai 😄 pehle email toh daalo!");
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/user/forgot-password`, {
        email,
      });

      if (res.data.success) {
        toast.success("📩 Email check karo... password yaad dilane ka sandesh bhej diya 😄");
      } else {
        toast.error(res.data.message);
      }

    } catch (err) {
      console.log(err);
      toast.error("😅 Server ne kabootar nahi bheja... mail fail ho gaya!");
    }
  }

  return (
    <form onSubmit={OnSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>

      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
      </div>

      {currentState !== 'Login' && (
        <input
          type='text'
          className='w-full px-3 py-2 border border-gray-800'
          placeholder='Name'
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <input
        type='email'
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Email'
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className='w-full flex items-center border border-gray-800 px-3 py-2'>
        <input
          type={showPassword ? 'text' : 'password'}
          className='w-full outline-none'
          placeholder='Password'
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

       <span
  className='cursor-pointer'
  onClick={() => setShowPassword(!showPassword)}
>
  {showPassword ? <FaEyeSlash /> : <FaEye />}
</span>
      </div>

      {/* 🔥 CLEAN SECTION */}
      <div className='w-full flex justify-between text-sm mt-[-8px]'>

        {currentState === "Login" && (
          <p 
            className='cursor-pointer text-blue-500'
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </p>
        )}

        {currentState === 'Login'
          ? <p className='cursor-pointer' onClick={() => setCurrentState('Sign Up')}>Create Account</p>
          : <p className='cursor-pointer' onClick={() => setCurrentState('Login')}>Login Here</p>
        }

      </div>

      <button
  disabled={loading}
  className='bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-50'
>
  {loading
    ? "Please Wait..."
    : currentState === 'Login'
    ? 'Sign In'
    : 'Sign Up'}
</button>

      <button
        type="button"
        onClick={googleLogin}
        className="w-full border border-gray-400 py-2 flex items-center justify-center gap-3 hover:bg-gray-100 transition"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="google"
          className="w-5"
        />
        Continue with Google
      </button>

    </form>
  )
}

export default Login