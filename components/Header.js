import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="logo">
          <h1>Proof Response</h1>
        </Link>
        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign Up</Link>
        </nav>
      </div>
      <style jsx>{`
        .header {
          background-color: #fff;
          border-bottom: 1px solid #eaeaea;
          padding: 1rem 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          text-decoration: none;
          color: inherit;
        }
        .logo h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .nav {
          display: flex;
          gap: 2rem;
        }
        .nav a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav a:hover {
          color: #0070f3;
        }
      `}</style>
    </header>
  );
}

