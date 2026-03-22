import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
          // We can set default avatar URL or leave it empty for later
          avatar_url: '',
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      // Success. Often requires email confirmation, but for local dev we assume it succeeds.
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          {/* Logo Placeholder */}
          <h1 className="text-3xl font-bold font-serif mb-2">BharatFlow</h1>
          <p className="text-center text-gray-500 font-semibold text-lg leading-tight mt-2 text-balance">
            Sign up to see photos and videos from your friends.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Mobile Number or Email"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

          <p className="text-center text-xs text-gray-400 mt-2 leading-relaxed">
            People who use our service may have uploaded your contact information to BharatFlow. Learn More
          </p>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded bg-blue-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus:outline-none disabled:opacity-70"
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        <div className="my-6 flex items-center justify-between">
          <div className="h-px w-full bg-gray-300"></div>
          <span className="px-4 text-xs font-semibold text-gray-500 uppercase">OR</span>
          <div className="h-px w-full bg-gray-300"></div>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Have an account? </span>
          <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-700">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
