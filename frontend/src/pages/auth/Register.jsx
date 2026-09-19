import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Building, ArrowLeft, Loader2, Info, Sparkles, ShieldCheck, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import FloatingCard from '../../components/visual/FloatingCard';
import Floating from '../../components/animations/Floating';
import FadeUp from '../../components/animations/FadeUp';

// Helper for password strength
const checkPasswordStrength = (password) => {
  if (!password) return '';
  if (password.length < 6) return 'weak';
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) return 'strong';
  if (password.length >= 6 && ((hasLetters && hasNumbers) || (hasLetters && hasSpecial))) return 'fair';
  return 'weak';
};

const baseSchema = {
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
};

const volunteerSchema = z.object(baseSchema).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const ngoSchema = z.object({
  ...baseSchema,
  organizationName: z.string().min(2, 'Organization name is required')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  
  const roleParam = searchParams.get('role');
  const initialRole = roleParam === 'ngo' ? 'ngo' : roleParam === 'volunteer' ? 'volunteer' : null;
  const [step, setStep] = useState(initialRole ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState(initialRole || 'volunteer');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const schema = selectedRole === 'ngo' ? ngoSchema : volunteerSchema;
  const { register, handleSubmit, formState: { errors }, watch, reset } = useHookForm({
    resolver: zodResolver(schema),
    defaultValues: { role: selectedRole }
  });

  const passwordValue = watch('password');
  const strength = checkPasswordStrength(passwordValue);

  useEffect(() => {
    reset({ role: selectedRole }); // Reset form when role changes
  }, [selectedRole, reset]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: selectedRole
      };
      if (selectedRole === 'ngo') {
        payload.organizationName = data.organizationName;
      }

      await authService.register(payload);
      toast.success('Registration successful!');
      
      // Auto login
      const user = await login(data.email, data.password);
      
      if (user.role === 'ngo') navigate('/ngo/dashboard');
      else navigate('/volunteer/dashboard');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden pt-16 pb-12 bg-transparent">
      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-400 tracking-tight">
            VolunteerConnect
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">Create your account</h2>
          <p className="text-sm text-gray-400 mt-1">Join a global network of changemakers and verified organizations</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
              <button 
                onClick={() => handleRoleSelect('volunteer')}
                className="bg-[#0a0f28]/45 backdrop-blur-[20px] border border-white/[0.12] p-8 rounded-3xl hover:border-primary-500/50 hover:bg-[#0a0f28]/65 transition-all group text-left shadow-glass hover:shadow-[0_12px_40px_rgba(99,102,241,0.25)] relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-7 h-7 text-primary-400" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/25">
                    Individual
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">I want to Volunteer</h3>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">Discover causes, track your hours, and earn verifiable certificates for your civic resume.</p>

                {/* Mini Visual Preview */}
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-gray-900 border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80"
                    alt="Volunteer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">
                    🌱 12,000+ Active Drives
                  </span>
                </div>

                <span className="inline-flex items-center text-primary-400 font-semibold group-hover:translate-x-1 transition-transform text-sm">
                  Continue as Volunteer <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </span>
              </button>

              <button 
                onClick={() => handleRoleSelect('ngo')}
                className="bg-[#0a0f28]/45 backdrop-blur-[20px] border border-white/[0.12] p-8 rounded-3xl hover:border-accent-500/50 hover:bg-[#0a0f28]/65 transition-all group text-left shadow-glass hover:shadow-[0_12px_40px_rgba(16,185,129,0.25)] relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building className="w-7 h-7 text-accent-400" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-accent-500/15 text-accent-300 border border-accent-500/25">
                    Non-Profit
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">I represent an NGO</h3>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">Publish initiatives, approve volunteers in bulk, and issue automated certificates.</p>

                {/* Mini Visual Preview */}
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-gray-900 border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80"
                    alt="NGO"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">
                    🛡️ Official Verification
                  </span>
                </div>

                <span className="inline-flex items-center text-accent-400 font-semibold group-hover:translate-x-1 transition-transform text-sm">
                  Continue as NGO <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </span>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-[#0a0f28]/45 backdrop-blur-[20px] border border-white/[0.12] p-8 rounded-3xl max-w-lg mx-auto w-full shadow-[0_8px_32px_0_rgba(0,0,0,0.35)]"
            >
              <button 
                onClick={() => setStep(1)}
                className="flex items-center text-gray-400 hover:text-white mb-6 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to role selection
              </button>

              <div className="flex items-center mb-6 p-4 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10">
                {selectedRole === 'volunteer' ? (
                  <User className="w-6 h-6 text-primary-400 mr-3" />
                ) : (
                  <Building className="w-6 h-6 text-accent-400 mr-3" />
                )}
                <div>
                  <h3 className="text-white font-semibold">Registering as {selectedRole === 'volunteer' ? 'Volunteer' : 'NGO'}</h3>
                  <p className="text-xs text-gray-400">Fill in your details below</p>
                </div>
              </div>

              {selectedRole === 'ngo' && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl flex items-start">
                  <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-200/80">NGO accounts require admin verification before you can publish opportunities.</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {selectedRole === 'ngo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Organization Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        {...register('organizationName')}
                        className={`block w-full pl-11 pr-3 py-3 bg-white/[0.05] border ${errors.organizationName ? 'border-red-500' : 'border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-white outline-none transition-all placeholder-gray-400`}
                        placeholder="Organization Name"
                      />
                    </div>
                    {errors.organizationName && <p className="mt-1 text-xs text-red-400">{errors.organizationName.message}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name {selectedRole === 'ngo' ? '(Contact Person)' : ''}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register('name')}
                      className={`block w-full pl-11 pr-3 py-3 bg-white/[0.05] border ${errors.name ? 'border-red-500' : 'border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-white outline-none transition-all placeholder-gray-400`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      {...register('email')}
                      className={`block w-full pl-11 pr-3 py-3 bg-white/[0.05] border ${errors.email ? 'border-red-500' : 'border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-white outline-none transition-all placeholder-gray-400`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`block w-full pl-11 pr-10 py-3 bg-white/[0.05] border ${errors.password ? 'border-red-500' : 'border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-white outline-none transition-all placeholder-gray-400`}
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
                  {/* Strength indicator */}
                  {passwordValue && (
                    <div className="flex mt-2 space-x-1">
                      <div className={`h-1 flex-1 rounded-full ${strength === 'weak' ? 'bg-red-500' : strength === 'fair' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${strength === 'fair' || strength === 'strong' ? (strength === 'fair' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-white/10'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${strength === 'strong' ? 'bg-green-500' : 'bg-white/10'}`}></div>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={`block w-full pl-11 pr-10 py-3 bg-white/[0.05] border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-white outline-none transition-all placeholder-gray-400`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white ${selectedRole === 'ngo' ? 'bg-accent-600 hover:bg-accent-500 focus:ring-accent-500' : 'bg-primary-600 hover:bg-primary-500 btn-glow focus:ring-primary-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all mt-6`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center relative z-10">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
