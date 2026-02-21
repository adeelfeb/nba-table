'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { safeParseJsonResponse } from '../../utils/safeJsonResponse'

export default function NBAGamesList() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState(7)

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/nba/schedule?days=${dateRange}`)
        const json = await safeParseJsonResponse(res)
        if (!res.ok) throw new Error(json.error || json.message || 'Failed to fetch')
        setGames(json.data?.games || [])
      } catch (err) {
        setError(err.message || 'Could not load games')
        setGames([])
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [dateRange])

  const formatDate = (isoString) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading games…</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-400">
            <p className="font-medium">{error}</p>
            <p className="text-sm text-gray-400 mt-2">Please try again later.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            NBA Games
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Show:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value={3}>3 days</option>
              <option value={5}>5 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </select>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No games scheduled for this period.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence mode="popLayout">
              {games.map((game, index) => (
                <motion.li
                  key={game.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 md:p-5 hover:border-slate-600 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Teams */}
                    <div className="flex-1 flex items-center gap-3 md:gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={game.away?.logo || `https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/default.png`}
                          alt={game.away?.abbreviation}
                          className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full object-contain bg-slate-700"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">
                            {game.away?.name}
                          </p>
                          <p className="text-xs text-gray-400">{(game.away?.record || '').trim() || '—'}</p>
                        </div>
                      </div>
                      <span className="text-gray-500 font-medium hidden md:inline">@</span>
                      <div className="flex items-center gap-2 min-w-0 md:pl-0 pl-10">
                        <img
                          src={game.home?.logo || `https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/default.png`}
                          alt={game.home?.abbreviation}
                          className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full object-contain bg-slate-700"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">
                            {game.home?.name}
                          </p>
                          <p className="text-xs text-gray-400">{(game.home?.record || '').trim() || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Score (if completed) or time */}
                    <div className="flex-shrink-0 md:w-24 text-center">
                      {game.completed ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl font-bold text-white">{game.away?.score ?? '—'}</span>
                          <span className="text-gray-500">-</span>
                          <span className="text-xl font-bold text-white">{game.home?.score ?? '—'}</span>
                        </div>
                      ) : (
                        <p className="text-orange-400 font-semibold text-sm">
                          {formatTime(game.date)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="mt-3 pt-3 border-t border-slate-700 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>{formatDate(game.date)}</span>
                    {game.venue && <span>• {game.venue}</span>}
                    {game.broadcast && <span>• {game.broadcast}</span>}
                    {game.status && !game.completed && <span>• {game.status}</span>}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  )
}
