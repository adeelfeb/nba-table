import Head from 'next/head';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import ContactForm from '../components/designndev/ContactForm';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us | Design n Dev - Get in Touch</title>
        <meta 
          name="description" 
          content="Get in touch with Design n Dev for your web development needs. Ready to build your new venture? Let's discuss your specific requirements and start your project today." 
        />
        <meta 
          name="keywords" 
          content="contact web developer, hire web developer, web development consultation, get quote, web development services" 
        />
        <meta property="og:title" content="Contact Us | Design n Dev" />
        <meta 
          property="og:description" 
          content="Ready to build your new venture? Get in touch with us today." 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://designndev.com/contact" />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Get in Touch
              </h1>
              <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-1">
                Ready to build your new venture? Let's discuss your requirements and start your project today.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              <ContactForm showHeading={false} />

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg w-full min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="text-center md:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Why Choose Us?</h3>
                    <ul className="space-y-3 text-gray-600 text-sm sm:text-base">
                      <li>Expert Full-Stack Development</li>
                      <li>Modern Tech Stack (Next.js, MERN)</li>
                      <li>Agile Development Process</li>
                      <li>SEO Optimized Solutions</li>
                    </ul>
                  </div>

                  <div className="text-center md:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">What We Offer</h3>
                    <ul className="space-y-3 text-gray-600 text-sm sm:text-base">
                      <li>Custom Full-Stack Development</li>
                      <li>E-Commerce Platforms</li>
                      <li>CMS Development (WordPress/Webflow)</li>
                      <li>API Integration & Backend</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

