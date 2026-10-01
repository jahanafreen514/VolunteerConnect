import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Award, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden bg-transparent">
      
      {/* Decorative subtle pastel shapes behind login container */}
      <div 
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[90px] pointer-events-none"
        style={{ backgroundColor: 'rgba(221, 213, 243, 0.40)' }} // Pale lavender
      />
      <div 
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[90px] pointer-events-none"
        style={{ backgroundColor: 'rgba(216, 238, 229, 0.45)' }} // Mint
      />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Panel: Real Community Photography & Platform Highlights (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col space-y-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#BFD8C2] border border-[#AFCDB5] flex items-center justify-center shadow-soft-sm">
              <Heart className="w-5 h-5 text-[#26372B] fill-[#9fc2a6]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#26372B]">
              Volunteer<span className="text-[#556e5a]">Connect</span>
            </span>
          </Link>

          <div>
            <h1 className="text-3xl font-extrabold text-[#26372B] leading-tight mb-2">
              Welcome back to your civic impact hub
            </h1>
            <p className="text-sm text-[#667085] leading-relaxed">
              Continue discovering verified causes, managing community initiatives, and collecting certified proof of service.
            </p>
          </div>

          {/* Real Photography Card */}
          <div className="relative rounded-2xl overflow-hidden border border-[#E6E8EC] shadow-soft-md aspect-[16/10] bg-white">
            <img
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80"
              alt="Community volunteering moments"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
              <span className="font-semibold">Local Community Impact</span>
              <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px]">Verified Drives</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-[#E6E8EC] shadow-soft-sm text-xs font-medium text-[#354052]">
              <div className="w-6 h-6 rounded-lg bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] flex items-center justify-center font-bold">
                ✓
              </div>
              <span>100% Vetted Non-Profit Organizations</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-[#E6E8EC] shadow-soft-sm text-xs font-medium text-[#354052]">
              <div className="w-6 h-6 rounded-lg bg-[#C9DDF2] text-[#24426b] border-[#a3c5eb] flex items-center justify-center font-bold">
                ✓
              </div>
              <span>Audited Attendance & Verified Hours</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Clean Pastel Login Box (Requirement 20: NO DARK BOX) */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="glass-card p-6 sm:p-8 border border-[#E6E8EC] shadow-soft-lg">
            
            <div className="lg:hidden text-center mb-6">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#BFD8C2] border border-[#AFCDB5] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-[#26372B] fill-[#9fc2a6]" />
                </div>
                <span className="text-xl font-bold text-[#26372B]">VolunteerConnect</span>
              </Link>
            </div>

            <div className="text-center sm:text-left mb-6">
              <h2 className="text-2xl font-bold text-[#26372B] tracking-tight">Sign in to your account</h2>
              <p className="text-xs sm:text-sm text-[#667085] mt-1">Enter your credentials to access your dashboard.</p>
            </div>

            {apiError && (
              <div className="mb-5 p-3.5 bg-[#F2D6DD]/60 border border-[#e6b5c1] rounded-xl text-xs text-[#8C3B4A] text-center font-medium">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#354052] mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border ${errors.email ? 'border-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#354052]">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#556e5a] hover:text-[#26372B] font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border ${errors.password ? 'border-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#667085] hover:text-[#354052]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary-pastel w-full py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#26372B]" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#E6E8EC] text-center text-xs text-[#667085]">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#556e5a] hover:text-[#26372B]">
                Create an account
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
