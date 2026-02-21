'use client'

import { motion } from 'framer-motion'

/**
 * Skeleton placeholder that matches one NBA game card layout.
 * Uses shimmer animation for a polished loading state.
 */
function SkeletonBox({ className = '' }) {
  return (
    <div
      className={`rounded-lg bg-slate-700/60 skeleton-shimmer ${className}`}
      aria-hidden="true"
    />
  )
}

export default function GameCardSkeleton({ index = 0 }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 md:p-5"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Teams row */}
        <div className="flex-1 flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <SkeletonBox className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full" />
            <div className="min-w-0 space-y-1.5">
              <SkeletonBox className="h-4 w-24 md:w-28" />
              <SkeletonBox className="h-3 w-12" />
            </div>
          </div>
          <span className="text-slate-600 hidden md:inline">@</span>
          <div className="flex items-center gap-2 min-w-0 md:pl-0 pl-10">
            <SkeletonBox className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full" />
            <div className="min-w-0 space-y-1.5">
              <SkeletonBox className="h-4 w-24 md:w-28" />
              <SkeletonBox className="h-3 w-12" />
            </div>
          </div>
        </div>
        {/* Time/score placeholder */}
        <div className="flex-shrink-0 md:w-24 flex justify-center">
          <SkeletonBox className="h-5 w-16 rounded-md" />
        </div>
      </div>
      {/* Meta row */}
      <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-x-4 gap-y-1">
        <SkeletonBox className="h-3 w-28" />
        <SkeletonBox className="h-3 w-32" />
      </div>
    </motion.li>
  )
}

export function GamesListSkeleton({ count = 5 }) {
  return (
    <ul className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <GameCardSkeleton key={i} index={i} />
      ))}
    </ul>
  )
}
