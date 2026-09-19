import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    try {
      const user = await login(data.email, data.password);
      toast.success('Successfully logged in!');
      
      // Redirect based on role
      const isRoleMismatch = (user.role === 'volunteer' && (from.startsWith('/ngo') || from.startsWith('/admin'))) ||
                             (user.role === 'ngo' && (from.startsWith('/volunteer') || from.startsWith('/admin'))) ||
                             (user.role === 'admin' && (from.startsWith('/volunteer') || from.startsWith('/ngo')));

      if (!from || from === '/' || from === '/login' || isRoleMismatch) {
        if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
        else if (user.role === 'ngo') navigate('/ngo/dashboard', { replace: true });
        else navigate('/volunteer/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to login. Please check your credentials.';
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex relative overflow-hidden">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden">
        <AnimatedBackground />
        <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-[2px] z-0"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <Link to="/" className="inline-block mb-12 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 tracking-tight">
            VolunteerConnect
          </Link>
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">Welcome back</h1>
          <p className="text-xl text-gray-300 mb-10">Continue your journey of making a difference in communities worldwide.</p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-300 bg-gray-900/50 p-4 rounded-xl border border-gray-800/50 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400">✓</div>
              <span className="font-medium">Verified NGOs & Safe Opportunities</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300 bg-gray-900/50 p-4 rounded-xl border border-gray-800/50 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-accent-900/50 flex items-center justify-center text-accent-400">✓</div>
              <span className="font-medium">Track Progress & Impact</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300 bg-gray-900/50 p-4 rounded-xl border border-gray-800/50 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center text-green-400">✓</div>
              <span className="font-medium">Earn Recognition & Certificates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10 bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-block text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 tracking-tight">
              VolunteerConnect
            </Link>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Sign in to your account</h2>
              <p className="text-gray-400">Enter your email and password to access your dashboard.</p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className={`block w-full pl-10 pr-3 py-3 bg-gray-950 border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-800 focus:border-primary-500 focus:ring-primary-500'} rounded-xl text-white placeholder-gray-500 outline-none transition-colors`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-400">Password</label>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary-400 hover:text-primary-300">Forgot password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`block w-full pl-10 pr-10 py-3 bg-gray-950 border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-800 focus:border-primary-500 focus:ring-primary-500'} rounded-xl text-white placeholder-gray-500 outline-none transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
