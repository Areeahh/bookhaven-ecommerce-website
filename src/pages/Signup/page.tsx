import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../lib/supabase';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(name, email, password);
      navigate('/shop');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex justify-center items-center py-16 px-5 bg-linear-to-b from-blush to-cream">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md border border-ink/5">
        <h2 className="text-center font-display italic text-ink mb-2 text-3xl">Create Account</h2>
        <p className="text-center text-ink/50 mb-7.5">Join BookHaven today</p>

        {error && <p className="text-coral-dark text-sm text-center mb-4">{error}</p>}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="signup-name" className="font-medium text-ink/80 text-sm">Full Name</label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              className="p-3 border border-ink/15 bg-transparent text-ink rounded-lg transition-all focus:outline-none focus:border-coral"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="signup-email" className="font-medium text-ink/80 text-sm">Email Address</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="font-medium text-ink/80 text-sm">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="p-3 border border-ink/15 bg-transparent text-ink rounded-lg transition-all focus:outline-none focus:border-coral"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="signup-confirm" className="font-medium text-ink/80 text-sm">Confirm Password</label>
            <input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="p-3 border border-ink/15 bg-transparent text-ink rounded-lg transition-all focus:outline-none focus:border-coral"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-ink text-cream py-3 rounded-full font-medium hover:bg-coral border-none cursor-pointer disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center mt-6 text-ink/50 text-sm">
          Already have an account? <Link to="/login" className="text-coral no-underline hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
