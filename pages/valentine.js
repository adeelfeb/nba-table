import Head from 'next/head';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import Valentine from '../components/designndev/Valentine';

export default function ValentinePage() {
  return (
    <>
      <Head>
        <title>Valentine – Create a link for someone you love | Design n Dev</title>
        <meta
          name="description"
          content="Create a personal Valentine link with your message. Ask them to be your Valentine, send a love letter, or share how much they mean to you—free and private."
        />
        <meta
          name="keywords"
          content="Valentine link, be my Valentine, Valentine message, love letter, Valentine's Day, personal link"
        />
        <meta property="og:title" content="Valentine – Create a link for someone you love | Design n Dev" />
        <meta
          property="og:description"
          content="Create a beautiful, one-of-a-kind page with your message. One link, one moment, all yours."
        />
        <meta property="og:type" content="website" />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Valentine />
        </main>
        <Footer />
      </div>
    </>
  );
}
