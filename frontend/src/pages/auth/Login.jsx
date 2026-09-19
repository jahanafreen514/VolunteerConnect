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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Motion Background */}
      <AnimatedBackground showParticles={true} />

      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden z-10">
        <div className="relative z-10 w-full max-w-lg">
          <Link to="/" className="inline-block mb-10 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-400 tracking-tight">
            VolunteerConnect
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Welcome back</h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">Continue your journey of making a difference in communities worldwide.</p>
          
          <div className="space-y-3.5">
            <div className="flex items-center space-x-3.5 text-gray-200 bg-white/[0.03] backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-glass">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300 font-bold">✓</div>
              <span className="font-medium text-sm">Verified NGOs & Safe Opportunities</span>
            </div>
            <div className="flex items-center space-x-3.5 text-gray-200 bg-white/[0.03] backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-glass">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold">✓</div>
              <span className="font-medium text-sm">Track Progress & Impact</span>
            </div>
            <div className="flex items-center space-x-3.5 text-gray-200 bg-white/[0.03] backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-glass">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold">✓</div>
              <span className="font-medium text-sm">Earn Recognition & Certificates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Glassmorphic Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-block text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-400 tracking-tight">
              VolunteerConnect
            </Link>
          </div>
          
          <div className="bg-white/[0.04] backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Sign in to your account</h2>
              <p className="text-gray-400 text-sm">Enter your email and password to access your dashboard.</p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className={`block w-full pl-11 pr-3 py-3 bg-white/[0.05] border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-white placeholder-gray-400 outline-none transition-all`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-primary-400 hover:text-primary-300">Forgot password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`block w-full pl-11 pr-10 py-3 bg-white/[0.05] border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-white placeholder-gray-400 outline-none transition-all`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 btn-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
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
