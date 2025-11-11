import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="home">
        <div className="container">
          <h1>Proof Response Funding Intelligence Engine</h1>
          <p className="description">Automating discovery and structuring of funding opportunities across B2B and B2C markets</p>
          <div className="features">
            <div className="feature-card">
              <h3>Frontend Ready</h3>
              <p>Modular components and pages for rapid iteration</p>
            </div>
            <div className="feature-card">
              <h3>Backend API</h3>
              <p>Mongoose-powered API routes with auth and user management</p>
            </div>
            <div className="feature-card">
              <h3>MongoDB Connected</h3>
              <p>Reusable connection helper and User model scaffold</p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .home {
          padding: 4rem 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-align: center;
        }
        .description {
          font-size: 1.25rem;
          color: #666;
          text-align: center;
          margin-bottom: 3rem;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }
        .feature-card {
          background: #fff;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 2rem;
          transition: box-shadow 0.2s;
        }
        .feature-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #0070f3;
        }
        .feature-card p {
          color: #666;
          line-height: 1.6;
        }
      `}</style>
    </Layout>
  );
}

