import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'Design n Dev | Expert Full-Stack Web Development & Next.js Solutions',
  description: 'Turn your business idea into reality with Design n Dev. We specialize in fast, scalable custom development using Next.js, MERN Stack, and Node.js for startups and enterprises.',
  keywords: 'Next.js development, MERN stack agency, Startup MVP development, Full-stack web development, React development, Node.js development',
  openGraph: {
    title: 'Design n Dev | Expert Full-Stack Web Development & Next.js Solutions',
    description: 'Turn your business idea into reality with Design n Dev. We specialize in fast, scalable custom development using Next.js, MERN Stack, and Node.js for startups and enterprises.',
    url: 'https://designndev.com',
    siteName: 'Design n Dev',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-white`}>
        {children}
      </body>
    </html>
  )
}

