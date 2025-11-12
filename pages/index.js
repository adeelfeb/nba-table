import Header from '../components/Header';
import Hero from '../components/Hero';
import Reference from '../components/Reference';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import Overview from '../components/Overview';

export default function Home() {
  return (
    <div className="home">
      <Header />
      <main>
        <Hero
          intro="This platform extends PipeProof's main website by automating the discovery and structuring of grants, rebates, RFPs, RFQs, bursaries, and co-marketing funds across B2B and B2C markets. It ensures every opportunity is structured, scored, and ready for activation by the Proof360 ecosystem."
        />
        <Overview />
        <Reference
          stats={[
            '4.9 rated on Google',
            'Serving homeowners and businesses across Calgary year‑round',
          ]}
        />
        <CTA />
      </main>
      <Footer />
      <style jsx>{`
        .home { background: #fff; }
      `}</style>
    </div>
  );
}

