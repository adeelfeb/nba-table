import Navbar from '../components/designndev/Navbar'
import NBAHero from '../components/designndev/NBAHero'
import NBAGamesList from '../components/designndev/NBAGamesList'
import ContactForm from '../components/designndev/ContactForm'
import Footer from '../components/designndev/Footer'

export const metadata = {
  title: 'NBA Games | Upcoming NBA Schedule, Scores & Standings',
  description: 'Stay up to date with the latest NBA games. View upcoming schedule, scores, team records, venues, and broadcast channels. Mobile-friendly and always updated.',
  keywords: 'NBA, basketball, schedule, scores, games, standings, ESPN',
  openGraph: {
    title: 'NBA Games | Upcoming NBA Schedule, Scores & Standings',
    description: 'Stay up to date with the latest NBA games. View upcoming schedule, scores, team records, venues, and broadcast channels.',
    url: 'https://nba-games.example.com',
    siteName: 'NBA Games',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />
      <NBAHero />
      <div id="games">
        <NBAGamesList />
      </div>
      <div className="bg-slate-50">
        <ContactForm />
      </div>
      <Footer />
    </main>
  )
}
