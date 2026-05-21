import React, { useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink, Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Navbar = () => {

    const [visible, setVisible] = useState(false)

    const { setShowSearch, getCartCount, token, logout, navigate } = useContext(ShopContext)

    const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'

    return (
        <div className='flex items-center justify-between py-5 font-medium'>

            {/* LOGO */}
            <Link to='/'>
                <img src={assets.logo} className='w-36' alt="logo" />
            </Link>

            {/* NAV LINKS */}
            <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
                <NavLink to='/' className='flex flex-col items-center gap-1'>
                    <p>HOME</p>
                </NavLink>

                <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                    <p>COLLECTION</p>
                </NavLink>

                <NavLink to='/about' className='flex flex-col items-center gap-1'>
                    <p>ABOUT</p>
                </NavLink>

                <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                    <p>CONTACT</p>
                </NavLink>
            </ul>

            {/* RIGHT SIDE */}
            <div className='flex items-center gap-6'>

                {/* ADMIN PANEL */}
                <a
                    href={adminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className='hidden sm:inline-flex items-center rounded-full border border-gray-400 px-4 py-1.5 text-sm text-gray-800 hover:bg-gray-50 transition'
                >
                    Admin Panel
                </a>

                {/* SEARCH */}
                <img
                    onClick={() => setShowSearch(true)}
                    src={assets.search_icon}
                    className='w-5 cursor-pointer'
                    alt=""
                />

                {/* PROFILE DROPDOWN */}
                <div className='relative group'>

                    <img
                        onClick={() => !token && navigate('/login')}
                        className='w-5 cursor-pointer'
                        src={assets.profile_icon}
                        alt=""
                    />

                    {token && (
                        <div className='hidden group-hover:block absolute right-0 pt-4 z-50'>
                            <div className='flex flex-col gap-2 w-40 py-3 px-5 bg-white text-gray-700 rounded shadow-lg border'>

                                <p
                                    onClick={() => navigate('/profile')}
                                    className='cursor-pointer hover:text-black'
                                >
                                    My Profile
                                </p>

                                <p
                                    onClick={() => navigate('/orders')}
                                    className='cursor-pointer hover:text-black'
                                >
                                    My Orders
                                </p>

                                <p
                                    onClick={() => navigate('/profile?section=wishlist')}
                                    className='cursor-pointer hover:text-black'
                                >
                                    Wishlist
                                </p>

                                <p
                                    onClick={logout}
                                    className='cursor-pointer hover:text-red-500'
                                >
                                    Logout
                                </p>

                            </div>
                        </div>
                    )}

                </div>

                {/* CART */}
                <Link to='/cart' className='relative'>
                    <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                    <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white rounded-full text-[8px]'>
                        {getCartCount()}
                    </p>
                </Link>

                {/* MOBILE MENU ICON */}
                <img
                    onClick={() => setVisible(true)}
                    src={assets.menu_icon}
                    className='w-5 cursor-pointer sm:hidden'
                    alt=""
                />
            </div>

            {/* MOBILE MENU */}
            <div className={`absolute top-0 right-0 bottom-0 bg-white transition-all overflow-hidden z-50 ${visible ? 'w-full' : 'w-0'}`}>

                <div className='flex flex-col text-gray-600'>

                    <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                        <p>Back</p>
                    </div>

                    <NavLink onClick={() => setVisible(false)} to='/' className='py-2 pl-6 border'>HOME</NavLink>
                    <NavLink onClick={() => setVisible(false)} to='/collection' className='py-2 pl-6 border'>COLLECTION</NavLink>
                    <NavLink onClick={() => setVisible(false)} to='/about' className='py-2 pl-6 border'>ABOUT</NavLink>
                    <NavLink onClick={() => setVisible(false)} to='/contact' className='py-2 pl-6 border'>CONTACT</NavLink>

                    <a
                        href={adminUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setVisible(false)}
                        className='py-2 pl-6 border'
                    >
                        ADMIN PANEL
                    </a>

                    {token && (
                        <>
                            <NavLink onClick={() => setVisible(false)} to='/profile' className='py-2 pl-6 border'>
                                MY PROFILE
                            </NavLink>

                            <NavLink onClick={() => setVisible(false)} to='/orders' className='py-2 pl-6 border'>
                                MY ORDERS
                            </NavLink>

                            <NavLink onClick={() => setVisible(false)} to='/profile?section=wishlist' className='py-2 pl-6 border'>
                                WISHLIST
                            </NavLink>
                        </>
                    )}

                </div>
            </div>

        </div>
    )
}

export default Navbar