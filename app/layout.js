import { Poppins } from 'next/font/google'
import '../styles/globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata = {
  title: 'NBA Games | Upcoming NBA Schedule, Scores & Standings',
  description: 'Stay up to date with the latest NBA games. View upcoming schedule, scores, team records, venues, and broadcast channels. Mobile-friendly and always updated.',
  keywords: 'NBA, basketball, schedule, scores, games, standings',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'NBA Games | Upcoming NBA Schedule, Scores & Standings',
    description: 'Stay up to date with the latest NBA games. View upcoming schedule, scores, team records, venues, and broadcast channels.',
    siteName: 'NBA Games',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} antialiased bg-slate-900`}>
        {children}
      </body>
    </html>
  )
}

