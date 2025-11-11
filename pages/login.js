import { useState } from 'react';
import Layout from '../components/Layout';
import Router from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error((data && data.message) || 'Login failed');
      }
      Router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="auth">
        <div className="container">
          <h1>Login</h1>
          <form onSubmit={onSubmit} className="form">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
          </form>
        </div>
      </div>
      <style jsx>{`
        .auth { padding: 4rem 0; }
        .container { max-width: 480px; margin: 0 auto; padding: 0 2rem; }
        h1 { text-align: center; margin-bottom: 2rem; }
        .form { display: grid; gap: 1rem; }
        input { padding: 0.75rem 1rem; border: 1px solid #eaeaea; border-radius: 6px; }
        .error { color: #c00; }
        button { padding: 0.75rem 1rem; background: #0070f3; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
        button[disabled] { opacity: 0.7; cursor: not-allowed; }
      `}</style>
    </Layout>
  );
}


