import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, Loader2, CheckCircle2, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link. Please try again.';
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden bg-transparent">
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#BFD8C2]/40 border border-[#BFD8C2] flex items-center justify-center text-[#26372B]">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-[#354052] tracking-tight">
              Volunteer<span className="text-[#5b7f63]">Connect</span>
            </span>
          </Link>
        </div>

        <div className="pastel-card p-8 rounded-3xl border border-[#E6E8EC] shadow-soft-md">
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#D8EEE5] text-[#26372B] flex items-center justify-center mx-auto border border-[#BFD8C2]">
                <CheckCircle2 className="w-6 h-6 text-[#5b7f63]" />
              </div>
              <h2 className="text-2xl font-bold text-[#354052]">Check your email</h2>
              <p className="text-[#667085] text-sm leading-relaxed">
                If an account exists with that email address, we have sent instructions to reset your password.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="btn-primary-pastel inline-flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-soft-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#354052] mb-2">Forgot Password?</h2>
                <p className="text-[#667085] text-sm">
                  Enter your registered email address and we will send you a link to reset your password.
                </p>
              </div>

              {apiError && (
                <div className="mb-6 p-4 bg-[#F2D6DD]/60 border border-[#F2D6DD] rounded-xl text-[#9B5B65] text-sm text-center">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#354052] mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#667085]" />
                    </div>
                    <input
                      type="email"
                      {...register('email')}
                      className={`block w-full pl-11 pr-3 py-3 bg-white border ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-[#354052] placeholder-[#667085]/60 outline-none transition-all`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary-pastel w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold shadow-soft-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center text-sm font-medium text-[#5b7f63] hover:text-[#426048] transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
