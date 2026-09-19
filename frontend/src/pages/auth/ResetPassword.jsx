import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

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
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[2px] z-0"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 tracking-tight">
            VolunteerConnect
          </Link>
        </div>

        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-900/40 text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Password Reset Successful!</h2>
              <p className="text-gray-400 text-sm">
                Your password has been changed. You will be redirected to the sign-in page shortly.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 transition-colors"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
                <p className="text-gray-400 text-sm">
                  Please enter your new password below.
                </p>
              </div>

              {apiError && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`block w-full pl-10 pr-10 py-3 bg-gray-950 border ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-primary-500'} rounded-xl text-white placeholder-gray-500 outline-none transition-colors`}
                      placeholder="At least 6 characters"
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

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={`block w-full pl-10 pr-10 py-3 bg-gray-950 border ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-primary-500'} rounded-xl text-white placeholder-gray-500 outline-none transition-colors`}
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                  Remember your password? Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
