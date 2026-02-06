'use client'

import { motion } from 'framer-motion'
import { Heart, Link2, Mail, Palette, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Valentine() {
  const features = [
    {
      icon: Link2,
      title: 'Your own link',
      description: 'Create a unique, shareable link that opens a personal page just for your special someone.',
    },
    {
      icon: Mail,
      title: 'Custom message',
      description: 'Write a heartfelt message, "Will you be my Valentine?", or a love letter they’ll never forget.',
    },
    {
      icon: Palette,
      title: 'Themes & style',
      description: 'Pick from romantic, classic, or minimal themes and colors so the page feels like you.',
    },
    {
      icon: Heart,
      title: 'Private & free',
      description: 'No ads, no tracking of your message. Just a beautiful page for the one you love.',
    },
  ]

  const messageIdeas = [
    {
      title: 'Sweet & simple',
      examples: [
        'Happy Valentine’s Day to my favorite person. Life’s just better when you’re next to me.',
        'Every day with you is my favorite. Let’s make a million more of them.',
        "You're my happily ever after.",
      ],
    },
    {
      title: 'Romantic',
      examples: [
        "I'd choose you in every lifetime. Over and over. Happy Valentine's Day.",
        'You may hold my hand for a while, but you hold my heart forever.',
        'Every love story is beautiful but ours is my favorite.',
      ],
    },
    {
      title: 'Ask the question',
      examples: [
        "Will you be my Valentine? I've been hoping you'd say yes.",
        "I made something just for you. Will you be my Valentine?",
        'There’s no one else I’d rather spend Valentine’s with. Be mine?',
      ],
    },
  ]

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-rose-100 blur-3xl opacity-50" />
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-pink-100 blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 text-rose-700 mb-8">
                <Heart className="w-4 h-4 fill-rose-500" />
                <span className="text-sm font-semibold uppercase tracking-wide">Valentine’s Day</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8">
                A personal link for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">
                  someone you love
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Create a beautiful, one-of-a-kind page with your message—ask them to be your Valentine,
                share a love letter, or tell them how much they mean to you. One link, one moment, all yours.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login?redirect=/dashboard#valentine-urls"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full hover:shadow-lg hover:shadow-rose-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 no-underline"
                >
                  Create my Valentine link
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 no-underline"
                >
                  How it works
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sign in, create your link in the dashboard, and share. Your recipient gets a private page with your message.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-rose-100 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Message ideas */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-rose-600 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">What to write</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Message ideas for your link</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Use these as inspiration. The best messages are personal—add a memory, inside joke, or their name.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {messageIdeas.map((group, i) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-rose-700 mb-4">{group.title}</h3>
                <ul className="space-y-3">
                  {group.examples.map((text, j) => (
                    <li key={j} className="text-gray-600 text-sm leading-relaxed pl-3 border-l-2 border-rose-100">
                      "{text}"
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to create your Valentine link?
          </h2>
          <p className="text-gray-600 mb-8">
            Sign in and go to Valentine Links in your dashboard. Add their name, your message, pick a theme—then share the link.
          </p>
          <Link
            href="/login?redirect=/dashboard#valentine-urls"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-full hover:shadow-lg hover:shadow-rose-200 hover:scale-105 transition-all duration-200 no-underline"
          >
            Create my link
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}
