import Navbar from '../components/designndev/Navbar'
import Hero from '../components/designndev/Hero'
import ValueProp from '../components/designndev/ValueProp'
import Services from '../components/designndev/Services'
import TechStack from '../components/designndev/TechStack'
import Process from '../components/designndev/Process'
import Footer from '../components/designndev/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ValueProp />
      <Services />
      <TechStack />
      <Process />
      <Footer />
    </main>
  )
}

