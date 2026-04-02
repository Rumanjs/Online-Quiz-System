import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(email, password, name);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-8 pt-8 pb-6 bg-indigo-600">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-indigo-100">Join us to start taking and creating quizzes.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start gap-3"
            >
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}

          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mb-8 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-3 rounded-lg transition-all focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 disabled:opacity-70"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>Sign Up <ArrowRight size={18} /></>
            )}
          </button>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
