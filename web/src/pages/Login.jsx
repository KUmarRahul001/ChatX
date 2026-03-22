import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center">
          {/* Logo Placeholder */}
          <h1 className="text-3xl font-bold font-serif mb-2">BharatFlow</h1>
          <p className="text-gray-500 text-sm">Welcome back</p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded bg-blue-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus:outline-none disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="my-6 flex items-center justify-between">
          <div className="h-px w-full bg-gray-300"></div>
          <span className="px-4 text-xs font-semibold text-gray-500 uppercase">OR</span>
          <div className="h-px w-full bg-gray-300"></div>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="font-semibold text-blue-500 hover:text-blue-700">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
