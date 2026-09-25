import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Building, ArrowLeft, Loader2, Info, Sparkles, ShieldCheck, Phone, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

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
  phone: z.string().optional(),
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();
  
  const roleParam = searchParams.get('role');
  const initialRole = roleParam === 'ngo' ? 'ngo' : roleParam === 'volunteer' ? 'volunteer' : null;
  const [step, setStep] = useState(initialRole ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState(initialRole || 'volunteer');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [otpChannel, setOtpChannel] = useState('email');
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [manualPhone, setManualPhone] = useState('');
  const [otpError, setOtpError] = useState('');

  const schema = selectedRole === 'ngo' ? ngoSchema : volunteerSchema;
  const { register, handleSubmit, formState: { errors }, watch, reset } = useHookForm({
    resolver: zodResolver(schema),
    defaultValues: { role: selectedRole }
  });

  const passwordValue = watch('password');
  const strength = checkPasswordStrength(passwordValue);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    reset({ role: selectedRole });
  }, [selectedRole, reset]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSearchParams({ role });
    setStep(2);
  };

  const executeRegistration = async (payloadToRegister) => {
    setIsLoading(true);
    try {
      await authService.register(payloadToRegister);
      toast.success('Registration successful! Welcome to VolunteerConnect 🎉');

      // Auto login
      const user = await login(payloadToRegister.email, payloadToRegister.password);
      if (user.role === 'ngo') navigate('/ngo/dashboard');
      else navigate('/volunteer/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your details.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const dispatchOTP = async (identifier, channel) => {
    setOtpSending(true);
    setOtpError('');
    try {
      const res = await authService.sendOTP({
        identifier,
        channel,
        purpose: 'registration'
      });
      toast.success(res?.message || `Verification code sent via ${channel.toUpperCase()}`);
      setCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification service is not available.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setOtpSending(false);
    }
  };

  // Direct fast registration from Step 2
  const onDirectRegister = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      password: data.password,
      role: selectedRole
    };
    if (selectedRole === 'ngo') {
      payload.organizationName = data.organizationName;
    }
    await executeRegistration(payload);
  };

  // Optional OTP flow initiation
  const onStartOtpFlow = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      password: data.password,
      role: selectedRole
    };
    if (selectedRole === 'ngo') {
      payload.organizationName = data.organizationName;
    }

    setPendingPayload(payload);
    setStep(3);
    setOtpCode('');
    setOtpChannel('email');
    dispatchOTP(data.email, 'email');
  };

  const handleChangeChannel = (channel) => {
    setOtpChannel(channel);
    const activePhone = pendingPayload?.phone || manualPhone;
    if (channel === 'sms' && !activePhone) {
      toast('Please enter your phone number below to receive your SMS code.', { icon: '📱' });
      return;
    }
    const id = channel === 'sms' ? activePhone : pendingPayload?.email;
    dispatchOTP(id, channel);
  };

  const handleSendManualPhone = () => {
    if (!manualPhone || manualPhone.trim().length < 6) {
      toast.error('Please enter a valid phone number');
      return;
    }
    const cleanPhone = manualPhone.trim();
    setPendingPayload(prev => ({ ...prev, phone: cleanPhone }));
    dispatchOTP(cleanPhone, 'sms');
  };

  const handleResendOTP = () => {
    if (cooldown > 0) return;
    const activePhone = pendingPayload?.phone || manualPhone;
    const id = otpChannel === 'sms' ? (activePhone || pendingPayload?.email) : pendingPayload?.email;
    dispatchOTP(id, otpChannel);
  };

  const handleVerifyAndRegister = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const activePhone = pendingPayload?.phone || manualPhone;
      const id = otpChannel === 'sms' ? activePhone : pendingPayload?.email;
      
      try {
        await authService.verifyOTP({
          identifier: id,
          otp: otpCode,
          purpose: 'registration'
        });
      } catch (otpErr) {
        // If OTP verification failed
        throw otpErr;
      }

      // Proceed with actual account registration
      const registrationPayload = {
        ...pendingPayload,
        phone: activePhone || pendingPayload?.phone || ''
      };
      await executeRegistration(registrationPayload);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed. Please check the code.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden pt-20 pb-16 bg-transparent">
      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-extrabold tracking-tight">
            <span className="text-slate-900 dark:text-white">Volunteer</span>
            <span className="gradient-text">Connect</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            Create your account
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
            Join a global community of changemakers and verified organizations
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
              {/* Volunteer Card */}
              <button 
                type="button"
                onClick={() => handleRoleSelect('volunteer')}
                className="bg-white/80 dark:bg-[#0a0f28]/50 backdrop-blur-xl border border-slate-200/90 dark:border-white/12 p-8 rounded-3xl hover:border-primary-400 dark:hover:border-primary-500/50 hover:shadow-xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-500/20 border border-primary-200 dark:border-primary-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-500/25">
                    Individual
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">I want to Volunteer</h3>
                <p className="text-slate-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                  Discover community causes, track your volunteer hours, and earn verifiable digital certificates.
                </p>

                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80"
                    alt="Volunteer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">
                    🌱 12,000+ Active Drives
                  </span>
                </div>

                <span className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-1 transition-transform text-sm">
                  Continue as Volunteer <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </span>
              </button>

              {/* NGO Card */}
              <button 
                type="button"
                onClick={() => handleRoleSelect('ngo')}
                className="bg-white/80 dark:bg-[#0a0f28]/50 backdrop-blur-xl border border-slate-200/90 dark:border-white/12 p-8 rounded-3xl hover:border-secondary-400 dark:hover:border-secondary-500/50 hover:shadow-xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-secondary-100 dark:bg-secondary-500/20 border border-secondary-200 dark:border-secondary-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building className="w-7 h-7 text-secondary-600 dark:text-secondary-400" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary-50 dark:bg-secondary-500/15 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-500/25">
                    Non-Profit
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">I represent an NGO</h3>
                <p className="text-slate-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                  Publish impactful initiatives, recruit passionate volunteers, and issue automated certificates.
                </p>

                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80"
                    alt="NGO"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">
                    🛡️ Official Verification
                  </span>
                </div>

                <span className="inline-flex items-center text-secondary-600 dark:text-secondary-400 font-semibold group-hover:translate-x-1 transition-transform text-sm">
                  Continue as NGO <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </span>
              </button>
            </motion.div>
          )}

          {/* STEP 2: REGISTRATION FORM */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="bg-white/90 dark:bg-[#0a0f28]/60 backdrop-blur-2xl border border-slate-200/90 dark:border-white/12 p-8 rounded-3xl max-w-lg mx-auto w-full shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.35)]"
            >
              <button 
                type="button"
                onClick={() => {
                  setSearchParams({});
                  setStep(1);
                }}
                className="flex items-center text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-6 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to role selection
              </button>

              <div className="flex items-center mb-6 p-4 bg-slate-50 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/10">
                {selectedRole === 'volunteer' ? (
                  <User className="w-6 h-6 text-primary-500 mr-3" />
                ) : (
                  <Building className="w-6 h-6 text-secondary-500 mr-3" />
                )}
                <div>
                  <h3 className="text-slate-900 dark:text-white font-semibold">
                    Registering as {selectedRole === 'volunteer' ? 'Volunteer' : 'NGO'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Fill in your information to get started</p>
                </div>
              </div>

              {selectedRole === 'ngo' && (
                <div className="mb-6 p-4 bg-secondary-50 dark:bg-secondary-500/10 border border-secondary-200 dark:border-secondary-500/20 rounded-2xl flex items-start">
                  <Info className="w-5 h-5 text-secondary-600 dark:text-secondary-400 mr-3 mt-0.5 shrink-0" />
                  <p className="text-xs text-secondary-700 dark:text-secondary-300 leading-relaxed">
                    NGO accounts undergo standard administrative verification before initiatives are published publicly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onDirectRegister)} className="space-y-4">
                {selectedRole === 'ngo' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                      Organization Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-slate-400 dark:text-gray-400" />
                      </div>
                      <input
                        type="text"
                        {...register('organizationName')}
                        className={`block w-full pl-11 pr-3 py-3 bg-slate-50 dark:bg-white/[0.05] border ${errors.organizationName ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-gray-500 text-sm`}
                        placeholder="e.g. Green Earth Foundation"
                      />
                    </div>
                    {errors.organizationName && <p className="mt-1 text-xs text-red-500">{errors.organizationName.message}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                    Full Name {selectedRole === 'ngo' ? '(Contact Person)' : ''} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 dark:text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register('name')}
                      className={`block w-full pl-11 pr-3 py-3 bg-slate-50 dark:bg-white/[0.05] border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-gray-500 text-sm`}
                      placeholder="e.g. Alex Johnson"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 dark:text-gray-400" />
                    </div>
                    <input
                      type="email"
                      {...register('email')}
                      className={`block w-full pl-11 pr-3 py-3 bg-slate-50 dark:bg-white/[0.05] border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-gray-500 text-sm`}
                      placeholder="alex@example.org"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                    Phone Number <span className="font-normal text-slate-400 dark:text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400 dark:text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="block w-full pl-11 pr-3 py-3 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-gray-500 text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 dark:text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`block w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-white/[0.05] border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-gray-500 text-sm`}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {passwordValue && (
                    <div className="flex mt-2 space-x-1">
                      <div className={`h-1 flex-1 rounded-full ${strength === 'weak' ? 'bg-red-500' : strength === 'fair' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                      <div className={`h-1 flex-1 rounded-full ${strength === 'fair' || strength === 'strong' ? (strength === 'fair' ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-white/10'}`} />
                      <div className={`h-1 flex-1 rounded-full ${strength === 'strong' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 dark:text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={`block w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-white/[0.05] border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'} rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-gray-500 text-sm`}
                      placeholder="Repeat your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 hover:opacity-95 shadow-glow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50 transition-all mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account & Get Started →'
                  )}
                </button>

                {/* Optional OTP verification route */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleSubmit(onStartOtpFlow)}
                    disabled={isLoading || otpSending}
                    className="text-xs text-slate-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1.5 font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-primary-500" />
                    <span>Prefer to verify with Email / SMS code first?</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: OTP VERIFICATION FLOW */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="bg-white/90 dark:bg-[#0a0f28]/60 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 p-8 rounded-3xl max-w-lg mx-auto w-full shadow-xl dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-500/20 border border-primary-200 dark:border-primary-500/30 flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Verify Your Account</h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 mb-6">
                Enter the 6-digit one-time code to complete your registration.
              </p>

              {/* Delivery Channel Choice */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => handleChangeChannel('email')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    otpChannel === 'email'
                      ? 'bg-primary-50 dark:bg-primary-500/25 border-primary-400 text-primary-700 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Verify by Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeChannel('sms')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    otpChannel === 'sms'
                      ? 'bg-primary-50 dark:bg-primary-500/25 border-primary-400 text-primary-700 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Verify by SMS</span>
                </button>
              </div>

              {otpChannel === 'sms' && !pendingPayload?.phone && (
                <div className="mb-4 text-left p-3.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl">
                  <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                    Enter Phone Number to Receive SMS Code:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="flex-1 py-2 px-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-primary-400"
                    />
                    <button
                      type="button"
                      onClick={handleSendManualPhone}
                      disabled={otpSending}
                      className="px-3.5 py-2 bg-primary-600 hover:bg-primary-500 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {otpSending ? 'Sending...' : 'Send SMS OTP'}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 mb-6 text-xs text-slate-600 dark:text-gray-300">
                <span>Code dispatched to: </span>
                <strong className="text-slate-900 dark:text-white">
                  {otpChannel === 'sms' ? (pendingPayload?.phone || manualPhone || 'your phone number') : pendingPayload?.email}
                </strong>
              </div>

              {/* Notice if SMTP or SMS is unconfigured or failed */}
              {otpError && (
                <div className="p-3.5 mb-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-left flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-amber-800 dark:text-amber-300">OTP Delivery Notice</p>
                    <p className="text-amber-700 dark:text-amber-200/90 mt-0.5">
                      Email/SMS verification service is in preview mode on this deployment. You can complete registration directly below.
                    </p>
                  </div>
                </div>
              )}

              {/* 6-Digit Code Input */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-2">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[10px] text-2xl font-mono py-3.5 bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/15 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/25 rounded-2xl text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleVerifyAndRegister}
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-primary-600 hover:bg-primary-500 disabled:opacity-50 transition-all shadow-glow-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Complete Registration'}
                </button>

                {/* Instant Bypass Button for Seamless Demo / Live Preview */}
                <button
                  type="button"
                  onClick={() => executeRegistration(pendingPayload)}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-gray-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Register Directly (Skip OTP Code)</span>
                </button>
              </div>

              {/* Resend & Back */}
              <div className="flex items-center justify-between mt-5 text-xs text-slate-500 dark:text-gray-400">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  ← Edit Information
                </button>

                {cooldown > 0 ? (
                  <span>Resend code in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={otpSending}
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium transition-colors"
                  >
                    {otpSending ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center relative z-10">
          <p className="text-sm text-slate-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
