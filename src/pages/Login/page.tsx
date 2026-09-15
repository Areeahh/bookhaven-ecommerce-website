import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/shop');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex justify-center items-center py-16 px-5 bg-linear-to-b from-blush to-cream">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md border border-ink/5">
        <h2 className="text-center font-display italic text-ink mb-2 text-3xl">Welcome Back</h2>
        <p className="text-center text-ink/50 mb-7.5">Login to your account</p>

        {error && <p className="text-coral-dark text-sm text-center mb-4">{error}</p>}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="font-medium text-ink/80 text-sm">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              className="p-3 border border-ink/15 bg-transparent text-ink rounded-lg transition-all focus:outline-none focus:border-coral"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="font-medium text-ink/80 text-sm">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="p-3 border border-ink/15 bg-transparent text-ink rounded-lg transition-all focus:outline-none focus:border-coral"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-ink text-cream py-3 rounded-full font-medium hover:bg-coral border-none cursor-pointer disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-6 text-ink/50 text-sm">
          Don't have an account? <Link to="/signup" className="text-coral no-underline hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
