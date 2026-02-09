'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Script from 'next/script'

export default function Hero() {
  const vantaRef = useRef(null)
  const vantaEffect = useRef(null)

  useEffect(() => {
    // Initialize Vanta effect after scripts are loaded
    const initVanta = () => {
      if (typeof window !== 'undefined' && window.VANTA && vantaRef.current && !vantaEffect.current) {
        // Detect if device is mobile
        const isMobile = window.innerWidth < 768
        
        vantaEffect.current = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: isMobile ? 0.6 : 1.00,
          scaleMobile: 0.6,
          color: 0xffffff,
          size: isMobile ? 0.8 : 1.30,
          backgroundColor: 0x0
        })
      }
    }

    let checkInterval = null

    // Check if scripts are already loaded
    if (typeof window !== 'undefined' && window.VANTA) {
      initVanta()
    } else {
      // Wait for scripts to load with optimized polling
      // Use requestAnimationFrame for better performance
      const checkVanta = () => {
        if (typeof window !== 'undefined' && window.VANTA) {
          initVanta()
          if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
          }
        }
      }
      
      // Use longer interval to reduce CPU usage
      checkInterval = setInterval(checkVanta, 200)

      // Cleanup interval after 5 seconds (reduced from 10)
      setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
        }
      }, 5000)
    }

    // Cleanup function
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [])

  return (
    <>
      {/* Load Vanta.js scripts with Next.js Script component for optimal performance */}
      {/* Use afterInteractive to load after page becomes interactive, improving initial load */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // After Three.js loads, load Vanta Globe
          if (typeof window !== 'undefined' && !window.VANTA) {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js'
            script.async = true
            script.defer = true
            script.onload = () => {
              // Vanta will be initialized by useEffect when it detects window.VANTA
            }
            document.body.appendChild(script)
          }
        }}
      />

      <section id="home" className="relative min-h-[65vh] flex items-center pt-8 md:pt-12 bg-black overflow-hidden">
        {/* Vanta.js Globe Background */}
        <div ref={vantaRef} className="absolute inset-0 w-full h-full" />
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12">
        <div className="relative max-w-4xl">
          <div className="text-left p-6 sm:p-8 md:p-10 lg:p-12 md:backdrop-blur-0 backdrop-blur-sm md:bg-transparent bg-black/20 rounded-2xl md:rounded-none">
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg"
            >
              Your Vision.{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Built & Deployed.
              </span>
            </motion.h1>

            {/* Subheadline — precise: web, software, deployments, hosting */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed drop-shadow-md"
            >
              <strong className="text-white">Website development</strong> and <strong className="text-white">software engineering</strong>. <strong className="text-blue-400">Docker</strong> and cloud deployments—hosting on GoDaddy, Hostinger, DigitalOcean, AWS. Setup, configuration, bug fixes. Our team delivers it.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start items-start sm:items-center"
            >
              <a
                href="/contact"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#work"
                className="bg-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                View Our Work
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

