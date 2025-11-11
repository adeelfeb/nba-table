import Link from 'next/link';

export default function Header({
  title = 'Funding Intelligence — Proof360 Extension',
  navItems = [
    { href: '/dashboard', label: 'Dashboard' },
  ],
}) {
  return (
    <header className="page-header">
      <div className="container header-grid">
        <div className="brand">
          <div className="logo">
            <h1 className="title">{title}</h1>
          </div>
        </div>
        <nav className="local-nav" aria-label="Primary">
          {navItems.map((item) => {
            const isDashboard = item.href === '/dashboard';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isDashboard ? 'nav-button' : 'nav-link'}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <style jsx>{`
        .page-header {
          border-bottom: 1px solid #eaeaea;
          background: #ffffff;
        }
        .header-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          padding: 1.25rem 0;
          align-items: center;
        }
        .logo {
          text-decoration: none;
          color: inherit;
        }
        .title {
          font-size: 1.25rem;
          line-height: 1.2;
          margin: 0;
          font-weight: 600;
          letter-spacing: -0.01em;
          text-decoration: none;
          transition: text-decoration-color 120ms ease-in-out;
        }
        .logo:hover .title {
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
        }
        .local-nav {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .nav-link {
          color: #333;
          text-decoration: none;
          padding: 0.45rem 0.65rem;
          border-radius: 6px;
          transition: background 0.2s;
          font-weight: 500;
        }
        .nav-link:hover {
          background: #f5f5f5;
        }
        /* Dashboard as button */
        .nav-button {
          color: #fff;
          background: #111;
          padding: 0.55rem 0.95rem;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 6px 16px rgba(0,0,0,0.12);
          border: 1px solid rgba(0,0,0,0.12);
          transition: transform 0.08s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }
        .nav-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.16);
          background: #000;
          border-color: rgba(0,0,0,0.2);
          text-decoration: none;
        }
        .nav-button:focus-visible {
          outline: 2px solid #111;
          outline-offset: 2px;
        }
        /* Prevent default underline in header links; rely on custom hovers above */
        .local-nav a:hover,
        .logo:hover { text-decoration: none; }
        @media (max-width: 768px) {
          .header-grid {
            grid-template-columns: 1fr;
          }
          .title {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </header>
  );
}

