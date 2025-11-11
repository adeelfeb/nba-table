import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
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
          intro="This platform extends PipeProof’s main website by automating the discovery and structuring of grants, rebates, RFPs, RFQs, bursaries, and co-marketing funds across B2B and B2C markets. It ensures every opportunity is structured, scored, and ready for activation by the Proof360 ecosystem."
          subtitle="Built with collaborators across data, product, and operations."
        />
        <Features
          items={[
            { title: 'Automated Discovery', description: 'Continuously finds funding opportunities across public and private sources.' },
            { title: 'Structured Intelligence', description: 'Normalizes region, vertical, eligibility, and assigns a ProofScore.' },
            { title: 'B2B vs B2C', description: 'Separates business vs consumer funding to match use-cases and activation paths.' },
            { title: 'Activation-Ready', description: 'Prepares opportunities for Proof360 activation and monetization.' },
          ]}
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

