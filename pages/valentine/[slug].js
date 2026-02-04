import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const THEME_STYLES = {
  classic: {
    rose: { bg: 'linear-gradient(135deg, #fef2f2 0%, #fce7f3 50%, #fdf2f8 100%)', primary: '#be123c', secondary: '#e11d48', accent: '#fda4af' },
    crimson: { bg: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)', primary: '#fecaca', secondary: '#fca5a5', accent: '#fef2f2' },
    blush: { bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fce7f3 100%)', primary: '#db2777', secondary: '#ec4899', accent: '#fbcfe8' },
    gold: { bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)', primary: '#b45309', secondary: '#d97706', accent: '#fcd34d' },
    lavender: { bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e9d5ff 100%)', primary: '#6d28d9', secondary: '#7c3aed', accent: '#c4b5fd' },
    coral: { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)', primary: '#c2410c', secondary: '#ea580c', accent: '#fdba74' },
  },
  romantic: {
    rose: { bg: 'linear-gradient(180deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 100%)', primary: '#9d174d', secondary: '#be185d', accent: '#f9a8d4' },
    crimson: { bg: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 40%, #b91c1c 100%)', primary: '#fecaca', secondary: '#fca5a5', accent: '#fef2f2' },
    blush: { bg: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)', primary: '#be185d', secondary: '#ec4899', accent: '#fce7f3' },
    gold: { bg: 'linear-gradient(180deg, #fef9c3 0%, #fde68a 40%, #fcd34d 100%)', primary: '#a16207', secondary: '#ca8a04', accent: '#fef3c7' },
    lavender: { bg: 'linear-gradient(180deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)', primary: '#5b21b6', secondary: '#6d28d9', accent: '#e9d5ff' },
    coral: { bg: 'linear-gradient(180deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)', primary: '#c2410c', secondary: '#ea580c', accent: '#ffedd5' },
  },
  minimal: {
    rose: { bg: '#ffffff', primary: '#e11d48', secondary: '#f43f5e', accent: '#ffe4e6' },
    crimson: { bg: '#fafafa', primary: '#b91c1c', secondary: '#dc2626', accent: '#fecaca' },
    blush: { bg: '#fffbff', primary: '#db2777', secondary: '#ec4899', accent: '#fce7f3' },
    gold: { bg: '#fffbeb', primary: '#b45309', secondary: '#d97706', accent: '#fef3c7' },
    lavender: { bg: '#faf5ff', primary: '#6d28d9', secondary: '#7c3aed', accent: '#ede9fe' },
    coral: { bg: '#fff7ed', primary: '#c2410c', secondary: '#ea580c', accent: '#ffedd5' },
  },
  vintage: {
    rose: { bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 30%, #fef2f2 70%)', primary: '#a16207', secondary: '#b91c1c', accent: '#fef3c7' },
    crimson: { bg: 'linear-gradient(135deg, #292524 0%, #44403c 50%, #57534e 100%)', primary: '#fecaca', secondary: '#fca5a5', accent: '#78716c' },
    blush: { bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fce7f3 100%)', primary: '#9d174d', secondary: '#be185d', accent: '#fef3c7' },
    gold: { bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 40%, #fde68a 100%)', primary: '#92400e', secondary: '#b45309', accent: '#fef3c7' },
    lavender: { bg: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 50%, #e9d5ff 100%)', primary: '#5b21b6', secondary: '#6d28d9', accent: '#ede9fe' },
    coral: { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)', primary: '#9a3412', secondary: '#c2410c', accent: '#ffedd5' },
  },
  blush: {
    rose: { bg: 'linear-gradient(135deg, #fff1f2 0%, #fecdd3 50%, #fda4af 100%)', primary: '#be123c', secondary: '#e11d48', accent: '#fef2f2' },
    crimson: { bg: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 50%, #fca5a5 100%)', primary: '#b91c1c', secondary: '#dc2626', accent: '#fef2f2' },
    blush: { bg: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 50%, #f9a8d4 100%)', primary: '#9d174d', secondary: '#db2777', accent: '#fdf2f8' },
    gold: { bg: 'linear-gradient(135deg, #fefce8 0%, #fef08a 50%, #fde047 100%)', primary: '#a16207', secondary: '#ca8a04', accent: '#fefce8' },
    lavender: { bg: 'linear-gradient(135deg, #f5f3ff 0%, #c4b5fd 50%, #a78bfa 100%)', primary: '#5b21b6', secondary: '#6d28d9', accent: '#f5f3ff' },
    coral: { bg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fdba74 100%)', primary: '#c2410c', secondary: '#ea580c', accent: '#fff7ed' },
  },
};

function getThemeVars(theme, color) {
  const themeMap = THEME_STYLES[theme] || THEME_STYLES.classic;
  return themeMap[color] || themeMap.rose;
}

export async function getServerSideProps() {
  return { props: {} };
}

export default function ValentinePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/valentine/view/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.data?.page) {
          setPage(data.data.page);
        } else {
          setError(data.message || 'This link is invalid or has been removed.');
        }
      } catch (err) {
        if (!cancelled) setError('Something went wrong. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <>
        <Head><title>Loading... | Valentine</title></Head>
        <div className="valentine-page valentine-loading-state">
          <div className="valentine-heart-pulse">❤</div>
          <p>Loading...</p>
        </div>
        <style jsx>{`
          .valentine-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
          .valentine-loading-state { background: #fef2f2; color: #64748b; }
          .valentine-heart-pulse { font-size: 3rem; animation: pulse 1.2s ease-in-out infinite; }
          @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        `}</style>
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        <Head><title>Invalid Link | Valentine</title></Head>
        <div className="valentine-page valentine-error-state">
          <span className="valentine-error-icon">💔</span>
          <h1>This link isn&apos;t valid</h1>
          <p>{error}</p>
        </div>
        <style jsx>{`
          .valentine-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; }
          .valentine-error-state { background: #fef2f2; color: #991b1b; }
          .valentine-error-icon { font-size: 4rem; margin-bottom: 1rem; }
          .valentine-error-state h1 { font-size: 1.5rem; margin: 0 0 0.5rem 0; }
          .valentine-error-state p { margin: 0; color: #64748b; }
        `}</style>
      </>
    );
  }

  const vars = getThemeVars(page.theme, page.themeColor);

  return (
    <>
      <Head>
        <title>For {page.recipientName} | Valentine</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="valentine-page" style={{ background: vars.bg }}>
        <div className="valentine-card">
          <div className="valentine-heart-icon">❤</div>
          <h1 className="valentine-welcome">{page.welcomeText}</h1>
          <p className="valentine-recipient">For {page.recipientName}</p>
          {!revealed ? (
            <button
              type="button"
              className="valentine-cta"
              style={{ background: vars.primary, color: vars.primary === '#fecaca' || vars.primary === '#fca5a5' ? '#1f2937' : '#fff' }}
              onClick={() => setRevealed(true)}
            >
              {page.buttonText}
            </button>
          ) : (
            <div className="valentine-message" style={{ borderColor: vars.secondary, color: vars.primary }}>
              {page.mainMessage ? (
                <p className="valentine-message-text">{page.mainMessage}</p>
              ) : (
                <p className="valentine-message-text">You are loved. 💕</p>
              )}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .valentine-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          transition: background 0.4s ease;
        }
        .valentine-card {
          max-width: 28rem;
          width: 100%;
          text-align: center;
          padding: 2.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        .valentine-heart-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          line-height: 1;
        }
        .valentine-welcome {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #1f2937;
        }
        .valentine-recipient {
          font-size: 1rem;
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }
        .valentine-cta {
          padding: 0.875rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        }
        .valentine-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        .valentine-message {
          margin-top: 0.5rem;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 2px solid;
          background: rgba(255, 255, 255, 0.6);
        }
        .valentine-message-text {
          margin: 0;
          font-size: 1.1rem;
          line-height: 1.6;
          white-space: pre-wrap;
        }
      `}</style>
    </>
  );
}
