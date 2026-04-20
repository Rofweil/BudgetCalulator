import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { database, sha256hex } from '../lib/firebase';
import { toast } from 'sonner@2.0.3';
import { UserPlus, PiggyBank } from 'lucide-react';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const trimmedUsername = username.trim();

      if (!trimmedUsername) {
        toast.error('Username required');
        return;
      }

      if (/\s/.test(trimmedUsername)) {
        toast.error('Username cannot contain spaces');
        return;
      }

      if (!password || !repeatPassword) {
        toast.error('Please enter password and repeat it');
        return;
      }

      if (password !== repeatPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const userRef = ref(database, `users/${trimmedUsername}`);
      const snap = await get(userRef);

      if (snap.exists()) {
        toast.error('Username taken — choose another');
        return;
      }

      const hashed = await sha256hex(password);
      await set(userRef, {
        password: hashed,
        salary: null,
        partTime: null,
        commitments: {
          electric: '',
          motorcycle: '',
          rent: '',
          shopee: '',
          telco: '',
          water: '',
        },
        homeDates: {},
        homeBudget: {},
      });

      toast.success('Account created — you can now login');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignUp();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1691302174364-1958bc3d3ff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWdneSUyMGJhbmslMjBzYXZpbmdzfGVufDF8fHx8MTc2NTM4ODIwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/85 to-green-900/90" />
      
      <div className="relative z-10 bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
            <PiggyBank className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-emerald-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Start your savings journey today</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-emerald-900 mb-2">Username</label>
            <input
              type="text"
              placeholder="Choose a username (no spaces)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-white"
            />
          </div>

          <div>
            <label className="block text-emerald-900 mb-2">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-white"
            />
          </div>

          <div>
            <label className="block text-emerald-900 mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-white"
            />
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              'Creating account...'
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Sign Up
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}