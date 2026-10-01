import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success('Password has been successfully reset!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
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
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#D8EEE5] text-[#26372B] flex items-center justify-center mx-auto border border-[#BFD8C2]">
                <CheckCircle2 className="w-6 h-6 text-[#5b7f63]" />
              </div>
              <h2 className="text-2xl font-bold text-[#354052]">Password Reset Successful!</h2>
              <p className="text-[#667085] text-sm leading-relaxed">
                Your password has been changed. You will be redirected to the sign-in page shortly.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="btn-primary-pastel inline-flex items-center justify-center w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-soft-sm"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#354052] mb-2">Create New Password</h2>
                <p className="text-[#667085] text-sm">
                  Please enter your new password below.
                </p>
              </div>

              {apiError && (
                <div className="mb-6 p-4 bg-[#F2D6DD]/60 border border-[#F2D6DD] rounded-xl text-[#9B5B65] text-sm text-center">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#354052] mb-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#667085]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`block w-full pl-11 pr-10 py-3 bg-white border ${errors.password ? 'border-red-400 focus:border-red-400' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-[#354052] placeholder-[#667085]/60 outline-none transition-all`}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#667085] hover:text-[#354052]"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#354052] mb-1">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#667085]" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={`block w-full pl-11 pr-10 py-3 bg-white border ${errors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-[#354052] placeholder-[#667085]/60 outline-none transition-all`}
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#667085] hover:text-[#354052]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary-pastel w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold shadow-soft-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
