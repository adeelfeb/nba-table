import Head from 'next/head';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';

export default function InformationPage() {
  return (
    <>
      <Head>
        <title>Information | NBA Games</title>
        <meta
          name="description"
          content="Information about the NBA Games website. Stay updated with NBA schedule, scores, and standings."
        />
        <meta name="keywords" content="NBA, basketball, schedule, scores, games, information" />
      </Head>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <h1 className="text-3xl md:4xl font-bold text-slate-900 mb-2">Information</h1>
          <p className="text-slate-500 text-sm mb-10">About NBA Games</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">About This Site</h2>
              <p>
                NBA Games is a mobile-friendly website that displays upcoming and recent NBA games. 
                We use ESPN data to show game schedules, scores, team records, venues, and broadcast information.
                The site is designed to work well on both desktop and mobile devices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Data Source</h2>
              <p>
                Game data is provided via ESPN&apos;s public API. Schedule, scores, team records, and broadcast 
                channels are updated regularly. We do not guarantee real-time accuracy and recommend 
                checking official sources for critical information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Features</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Upcoming and recent NBA game schedules</li>
                <li>Team names and current records</li>
                <li>Date, time, venue, and broadcast channel for each game</li>
                <li>Mobile-responsive design</li>
                <li>Blog section for NBA-related content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact</h2>
              <p>
                For questions or feedback, please use our{' '}
                <a href="/contact" className="text-orange-600 hover:text-orange-500 underline">
                  Contact
                </a>{' '}
                page.
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
