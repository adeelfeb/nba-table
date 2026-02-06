import Head from 'next/head';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Design n Dev</title>
        <meta
          name="description"
          content="Privacy policy for Design n Dev. How we handle your data when you use our website, Valentine links, New Year resolutions, and blogs."
        />
        <meta name="keywords" content="privacy policy, Design n Dev, data protection, website usage" />
        <meta property="og:title" content="Privacy Policy | Design n Dev" />
        <meta property="og:type" content="website" />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mb-10">Last updated: February 2025</p>

          <div className="prose prose-gray max-w-none space-y-10 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                This Privacy Policy describes how Design n Dev (“we”, “our”, or “us”) handles information in connection with your use of this website. By using our site, you agree to the practices described here. This policy applies to the utilization of all services offered on this website, including but not limited to: browsing the homepage, services, and tech stack pages; using the Valentine link feature; using the New Year Resolution service; reading or publishing blogs; viewing portfolio and contact pages; and using the dashboard when you have an account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Utilization of This Website</h2>
              <p className="mb-3">
                Our website provides the following services and features. Our privacy practices apply to how we treat data in the context of each:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>General browsing:</strong> Home, Services, Tech Stack, Portfolio, and Contact pages can be visited without creating an account. We do not track or store your personal information for these pages beyond what is technically necessary (e.g., server logs).</li>
                <li><strong>Valentine links:</strong> If you create a Valentine link (via the dashboard), you provide recipient name, optional email, and message content. This data is used only to generate and deliver the link and optional email. We do not sell or share this data with third parties for marketing.</li>
                <li><strong>New Year Resolution:</strong> Resolutions you create are stored in association with your account and are not shared with others. We do not use resolution content for advertising or selling.</li>
                <li><strong>Blogs:</strong> Content you publish (when logged in) is stored to display on the site. We do not sell your blog content or use it for advertising purposes.</li>
                <li><strong>Account & dashboard:</strong> To use resolutions, Valentine links, or blog publishing, you may sign up and log in. We store only what is needed to provide these features (e.g., email, account-related data).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Information We Collect and Use</h2>
              <p>
                We collect minimal information necessary to operate the services you use: account credentials and profile information when you register; content you submit (resolutions, Valentine messages, blogs); and technical data such as IP address or browser type where required for security or operation. We do not sell your personal information. We use this information only to provide, maintain, and improve our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies and Similar Technologies</h2>
              <p>
                We may use cookies or similar technologies for essential site operation (e.g., keeping you logged in, preferences). We do not use cookies for third-party advertising or tracking beyond what is needed for the utilization of this website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security and Retention</h2>
              <p>
                We take reasonable measures to protect your data. Your resolutions, Valentine link content, and blog content are stored securely and are not shared with third parties for marketing. We retain data only as long as necessary to provide the services or as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data where applicable. For account-related requests, use the contact information below or the options in your dashboard where available.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Open Source and Transparency</h2>
              <p>
                This project is open source. We are committed to transparency in how the website works and how we handle data. We do not collect, store, or sell your personal information for purposes beyond the utilization of this website and the services described above.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. The “Last updated” date at the top will reflect the latest version. Continued use of the website after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
              <p>
                For questions about this Privacy Policy or the utilization of your data on this website, you can reach us via the <Link href="/contact" className="text-blue-600 hover:underline">Contact</Link> page or at hello@designndev.com.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              ← Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
