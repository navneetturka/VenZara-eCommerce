import React, { useContext } from 'react'
import { ShopContext } from "./context/ShopContext";
import { useLocation } from "react-router-dom";
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Collection from './pages/Collection'
import Contact from './pages/Contact'
import OrderSuccess from "./pages/OrderSuccess";
import About from './pages/About'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import Verify from './pages/Verify'
import ResetPassword from "./pages/ResetPassword"
import Profile from './pages/Profile'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {

  const { token } = useContext(ShopContext);
  const location = useLocation();

  // 🔥 detect reset password page
  const isResetPage = location.pathname.startsWith("/reset-password");

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>

      <ToastContainer />

      {/* ✅ Navbar only when logged in AND not reset page */}
      {token && !isResetPage && <Navbar />}
      {token && !isResetPage && <SearchBar />}

      <Routes>
        <Route path="/" element={token ? <Home /> : <Login />} />
        <Route path='collection' element={token ? <Collection/> : <Login />} />
        <Route path='about' element={token ? <About/> : <Login />} />
        <Route path='contact' element={token ? <Contact/> : <Login />} />
        <Route path='product/:productId' element={token ? <Product/> : <Login />} />
        <Route path="/cart" element={token ? <Cart /> : <Login />} />
        <Route path='login' element={<Login/>} />
        <Route path='place-order' element={token ? <PlaceOrder/> : <Login />} />
        <Route path='orders' element={token ? <Orders/> : <Login />} />
        <Route path='/profile' element={token ? <Profile /> : <Login />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
      </Routes>

      {/* ✅ Footer always at bottom */}
      <Footer />

    </div>
  )
}

export default App;