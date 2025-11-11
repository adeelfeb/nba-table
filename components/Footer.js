export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} TheServer. All rights reserved.</p>
      </div>
      <style jsx>{`
        .footer {
          background-color: #fafafa;
          border-top: 1px solid #eaeaea;
          padding: 2rem 0;
          margin-top: auto;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: center;
        }
        .footer p {
          margin: 0;
          color: #666;
          font-size: 0.875rem;
        }
      `}</style>
    </footer>
  );
}

