'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NBAHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            <span className="text-orange-500">NBA</span> Games
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Upcoming and recent NBA games, scores, and schedules. Mobile-friendly and always updated.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="#games"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors"
            >
              View Games
            </Link>
            <Link
              href="/blogs"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
            >
              Blog
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
