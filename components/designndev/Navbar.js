'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// Support both App Router and Pages Router
function useRouterCompat() {
  const [pathname, setPathname] = useState('')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname)
      
      const handleRouteChange = () => {
        setPathname(window.location.pathname)
      }
      
      window.addEventListener('popstate', handleRouteChange)
      
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args)
        handleRouteChange()
      }
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args)
        handleRouteChange()
      }
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange)
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
      }
    }
  }, [])
  
  return { asPath: pathname, pathname }
}

export default function Navbar() {
  const router = useRouterCompat()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (href) => {
    if (!isMounted) return false
    const pathname = router.asPath || router.pathname
    if (!pathname) return false
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/blogs', label: 'Blog' },
    { href: '/information', label: 'Information' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`navbar rounded-2xl px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-900/95 backdrop-blur-md shadow-lg'
            : 'bg-slate-900/90 backdrop-blur-sm shadow-md'
        }`}>
          <div className="flex items-center w-full">
            <div className="flex flex-1 justify-start min-w-0">
              <Link 
                href="/" 
                className="text-xl sm:text-2xl font-bold no-underline hover:scale-110 transition-transform duration-300 inline-block"
              >
                <span>
                  <span className="text-orange-500">NBA</span>
                  <span className="text-gray-300"> Games</span>
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex flex-1 justify-center">
              <div className="flex flex-wrap items-baseline justify-center gap-4 lg:gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 relative no-underline ${
                      isActive(item.href)
                        ? 'text-orange-400 font-semibold'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-orange-500"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex lg:hidden flex-1 justify-center">
              <div className="flex flex-wrap items-baseline justify-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2 py-2 text-xs font-medium transition-all duration-200 relative no-underline ${
                      isActive(item.href)
                        ? 'text-orange-400 font-semibold'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-orange-500"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-1 justify-end items-center gap-2">
              <div className="hidden lg:block">
                <Link
                  href="/login"
                  className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 no-underline text-sm"
                >
                  Login
                </Link>
              </div>
              <div className="hidden lg:block ml-2">
                <Link
                  href="/signup"
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 no-underline text-sm"
                >
                  Sign Up
                </Link>
              </div>

              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  className="text-gray-300 hover:text-white focus:outline-none"
                  aria-label="Toggle menu"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4"
            >
              <div className="px-4 pt-3 pb-4 space-y-2 bg-slate-900/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-700">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2.5 text-base font-medium transition-all duration-200 rounded-lg no-underline ${
                      isActive(item.href)
                        ? 'text-orange-400 font-semibold bg-slate-800'
                        : 'text-gray-300 hover:text-white hover:bg-slate-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-3 mt-2 border-t border-slate-700 flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 text-center py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-sm no-underline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 text-center py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-sm no-underline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
