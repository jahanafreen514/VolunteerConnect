import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Building, ArrowLeft, Loader2, Info, Sparkles, ShieldCheck, Phone, Check, AlertCircle, Heart } from 'lucide-react';
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

  // Step 2 to Step 3: Trigger OTP flow if user desires
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

    const identifier = payload.email;
    await dispatchOTP(identifier, 'email');
  };

  const handleChangeChannel = async (newChannel) => {
    setOtpChannel(newChannel);
    const identifier = newChannel === 'sms' ? (pendingPayload?.phone || manualPhone) : pendingPayload?.email;
    if (identifier) {
      await dispatchOTP(identifier, newChannel);
    }
  };

  const handleSendManualPhone = async () => {
    if (!manualPhone || manualPhone.length < 7) {
      toast.error('Please enter a valid phone number with country code');
      return;
    }
    await dispatchOTP(manualPhone, 'sms');
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    const identifier = otpChannel === 'sms' ? (pendingPayload?.phone || manualPhone) : pendingPayload?.email;
    if (identifier) {
      await dispatchOTP(identifier, otpChannel);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden pt-16 pb-16 bg-transparent">
      
      {/* Decorative subtle pastel shapes */}
      <div 
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(221, 213, 243, 0.40)' }} // Pale lavender
      />
      <div 
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(216, 238, 229, 0.45)' }} // Mint
      />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#BFD8C2] border border-[#AFCDB5] flex items-center justify-center shadow-soft-sm">
              <Heart className="w-4 h-4 text-[#26372B] fill-[#9fc2a6]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#26372B]">
              Volunteer<span className="text-[#556e5a]">Connect</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26372B]">
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Join a global community of changemakers and verified organizations
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: ROLE SELECTION (Requirement 21) */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
              {/* Volunteer Card: Sage & Powder Blue */}
              <button 
                type="button"
                onClick={() => handleRoleSelect('volunteer')}
                className="glass-card p-6 sm:p-8 hover:border-[#BFD8C2] transition-all group text-left relative overflow-hidden bg-gradient-to-br from-white/95 via-[#f5f9f6]/90 to-[#eef5fa]/90 shadow-soft-md"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#D8EEE5] border border-[#bce1d3] flex items-center justify-center group-hover:scale-105 transition-transform text-[#244e44]">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3]">
                    Individual
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#26372B] mb-2">I want to Volunteer</h3>
                <p className="text-[#667085] text-xs sm:text-sm mb-5 leading-relaxed">
                  Discover community causes, track volunteer hours, and earn verifiable digital certificates.
                </p>

                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-slate-100 border border-[#E6E8EC]">
                  <img
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80"
                    alt="Volunteering moment"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">
                    🌱 Verified Opportunities
                  </span>
                </div>

                <span className="inline-flex items-center text-[#556e5a] font-semibold group-hover:translate-x-1 transition-transform text-xs sm:text-sm">
                  Continue as Volunteer <ArrowLeft className="w-4 h-4 ml-1.5 rotate-180" />
                </span>
              </button>

              {/* NGO Card: Lavender & Blush */}
              <button 
                type="button"
                onClick={() => handleRoleSelect('ngo')}
                className="glass-card p-6 sm:p-8 hover:border-[#DDD5F3] transition-all group text-left relative overflow-hidden bg-gradient-to-br from-white/95 via-[#faf8fe]/90 to-[#fdf7f8]/90 shadow-soft-md"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#DDD5F3] border border-[#c5b8eb] flex items-center justify-center group-hover:scale-105 transition-transform text-[#4d387a]">
                    <Building className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#DDD5F3] text-[#4d387a] border border-[#c5b8eb]">
                    Organization
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#26372B] mb-2">I am an NGO</h3>
                <p className="text-[#667085] text-xs sm:text-sm mb-5 leading-relaxed">
                  Publish volunteer drives, review applicants, and issue verified certificates to participants.
                </p>

                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-slate-100 border border-[#E6E8EC]">
                  <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80"
                    alt="NGO Community Initiative"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">
                    🛡️ Verified NGO Status
                  </span>
                </div>

                <span className="inline-flex items-center text-[#7556bf] font-semibold group-hover:translate-x-1 transition-transform text-xs sm:text-sm">
                  Continue as NGO <ArrowLeft className="w-4 h-4 ml-1.5 rotate-180" />
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
              className="glass-card p-6 sm:p-8 max-w-lg mx-auto w-full border border-[#E6E8EC] shadow-soft-lg"
            >
              <button 
                type="button"
                onClick={() => {
                  setSearchParams({});
                  setStep(1);
                }}
                className="flex items-center text-[#667085] hover:text-[#26372B] mb-5 text-xs sm:text-sm transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to role selection
              </button>

              <div className="flex items-center mb-5 p-3.5 bg-[#FFF8EF]/50 rounded-2xl border border-[#E6E8EC]">
                {selectedRole === 'volunteer' ? (
                  <div className="w-9 h-9 rounded-xl bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] flex items-center justify-center mr-3">
                    <User className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#DDD5F3] text-[#4d387a] border border-[#c5b8eb] flex items-center justify-center mr-3">
                    <Building className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-[#26372B]">
                    Registering as {selectedRole === 'volunteer' ? 'Individual Volunteer' : 'Non-Profit Organization'}
                  </h3>
                  <p className="text-xs text-[#667085]">Fill in your information to get started</p>
                </div>
              </div>

              {selectedRole === 'ngo' && (
                <div className="mb-5 p-3.5 bg-[#DDD5F3]/30 border border-[#c5b8eb] rounded-2xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#7556bf] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#4d387a] leading-relaxed">
                    NGO accounts undergo standard administrative verification before events are published publicly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onDirectRegister)} className="space-y-4">
                {selectedRole === 'ngo' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#354052] mb-1.5">
                      Organization Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                        <Building className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        {...register('organizationName')}
                        className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border ${errors.organizationName ? 'border-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                        placeholder="e.g. Green Earth Foundation"
                      />
                    </div>
                    {errors.organizationName && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.organizationName.message}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#354052] mb-1.5">
                    Full Name {selectedRole === 'ngo' ? '(Contact Person)' : ''} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      {...register('name')}
                      className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border ${errors.name ? 'border-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                      placeholder="e.g. Alex Johnson"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#354052] mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      {...register('email')}
                      className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border ${errors.email ? 'border-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                      placeholder="alex@example.org"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#354052] mb-1.5">
                    Phone Number <span className="font-normal text-[#667085]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#354052] mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border ${errors.password ? 'border-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#667085] hover:text-[#354052]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordValue && (
                    <div className="flex mt-2 space-x-1">
                      <div className={`h-1 flex-1 rounded-full ${strength === 'weak' ? 'bg-[#d48ea0]' : strength === 'fair' ? 'bg-[#eebd9e]' : 'bg-[#54947f]'}`} />
                      <div className={`h-1 flex-1 rounded-full ${strength === 'fair' || strength === 'strong' ? (strength === 'fair' ? 'bg-[#eebd9e]' : 'bg-[#54947f]') : 'bg-slate-200'}`} />
                      <div className={`h-1 flex-1 rounded-full ${strength === 'strong' ? 'bg-[#54947f]' : 'bg-slate-200'}`} />
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#354052] mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border ${errors.confirmPassword ? 'border-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                      placeholder="Repeat your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#667085] hover:text-[#354052]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.confirmPassword.message}</p>}
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary-pastel w-full py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#26372B]" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account & Get Started →</span>
                  )}
                </button>

                {/* Optional OTP route button */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleSubmit(onStartOtpFlow)}
                    disabled={isLoading || otpSending}
                    className="text-xs text-[#667085] hover:text-[#26372B] transition-colors inline-flex items-center gap-1.5 font-medium"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#54947f]" />
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
              className="glass-card p-6 sm:p-8 max-w-lg mx-auto w-full border border-[#E6E8EC] shadow-soft-lg text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D8EEE5] border border-[#bce1d3] flex items-center justify-center mx-auto mb-4 text-[#244e44]">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-[#26372B] mb-1">Verify Your Account</h3>
              <p className="text-xs text-[#667085] mb-5">
                Enter the 6-digit one-time code to complete your registration.
              </p>

              {/* Delivery Channel Choice */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => handleChangeChannel('email')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    otpChannel === 'email'
                      ? 'bg-[#D8EEE5] border-[#bce1d3] text-[#244e44] shadow-soft-sm'
                      : 'bg-white border-[#E6E8EC] text-[#667085] hover:text-[#26372B]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Verify by Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeChannel('sms')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    otpChannel === 'sms'
                      ? 'bg-[#D8EEE5] border-[#bce1d3] text-[#244e44] shadow-soft-sm'
                      : 'bg-white border-[#E6E8EC] text-[#667085] hover:text-[#26372B]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Verify by SMS</span>
                </button>
              </div>

              {otpChannel === 'sms' && !pendingPayload?.phone && (
                <div className="mb-4 text-left p-3.5 bg-white border border-[#E6E8EC] rounded-2xl">
                  <label className="block text-xs font-medium text-[#354052] mb-1.5">
                    Enter Phone Number to Receive SMS Code:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="flex-1 py-2 px-3 bg-white border border-[#E6E8EC] rounded-xl text-xs text-[#354052] outline-none focus:border-[#BFD8C2]"
                    />
                    <button
                      type="button"
                      onClick={handleSendManualPhone}
                      disabled={otpSending}
                      className="btn-primary-pastel px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap"
                    >
                      {otpSending ? 'Sending...' : 'Send SMS OTP'}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white border border-[#E6E8EC] mb-5 text-xs text-[#667085]">
                <span>Code dispatched to: </span>
                <strong className="text-[#26372B]">
                  {otpChannel === 'sms' ? (pendingPayload?.phone || manualPhone || 'your phone number') : pendingPayload?.email}
                </strong>
              </div>

              {otpError && (
                <div className="p-3 mb-4 rounded-xl bg-[#FFF8EF] border border-[#E6E8EC] text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#7a4221] shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-[#26372B]">Verification Notice</p>
                    <p className="text-[#667085] mt-0.5">
                      Email/SMS verification service preview. You can also register directly below.
                    </p>
                  </div>
                </div>
              )}

              {/* 6-Digit Code Input */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-[#667085] mb-2">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[10px] text-2xl font-mono py-3 bg-white border border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 rounded-xl text-[#26372B] outline-none transition-all placeholder-[#98A2B3]"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleVerifyAndRegister}
                  disabled={isLoading || otpCode.length !== 6}
                  className="btn-primary-pastel w-full py-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#26372B]" /> : 'Verify & Complete Registration'}
                </button>

                <button
                  type="button"
                  onClick={() => executeRegistration(pendingPayload)}
                  disabled={isLoading}
                  className="btn-secondary-pastel w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#54947f]" />
                  <span>Register Directly (Skip OTP Code)</span>
                </button>
              </div>

              {/* Resend & Back */}
              <div className="flex items-center justify-between mt-5 text-xs text-[#667085]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="hover:text-[#26372B] transition-colors"
                >
                  ← Edit Information
                </button>

                {cooldown > 0 ? (
                  <span>Resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={otpSending}
                    className="text-[#556e5a] hover:text-[#26372B] font-medium transition-colors"
                  >
                    {otpSending ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center relative z-10">
          <p className="text-xs sm:text-sm text-[#667085]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#556e5a] hover:text-[#26372B] transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
