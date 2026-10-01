import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { authService } from '../services/authService';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ['confirmPassword']
});

const ChangePasswordCard = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password updated successfully');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 pastel-card border border-[#E6E8EC]">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#E6E8EC]">
        <div className="p-2 rounded-xl bg-[#DDD5F3]/50 text-[#30264A] border border-[#DDD5F3]">
          <KeyRound className="w-5 h-5 text-[#8e74d1]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#354052]">Change Password</h3>
          <p className="text-xs text-[#667085]">Ensure your account uses a secure, up-to-date password.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-semibold text-[#354052] mb-1">Current Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[#667085]" />
            </div>
            <input
              type={showCurrent ? 'text' : 'password'}
              {...register('currentPassword')}
              className={`block w-full pl-9 pr-10 py-2.5 bg-white border ${errors.currentPassword ? 'border-red-400' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-[#354052] placeholder-[#667085]/60 text-sm outline-none transition-colors`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#667085] hover:text-[#354052]"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#354052] mb-1">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[#667085]" />
            </div>
            <input
              type={showNew ? 'text' : 'password'}
              {...register('newPassword')}
              className={`block w-full pl-9 pr-10 py-2.5 bg-white border ${errors.newPassword ? 'border-red-400' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-[#354052] placeholder-[#667085]/60 text-sm outline-none transition-colors`}
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#667085] hover:text-[#354052]"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#354052] mb-1">Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[#667085]" />
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={`block w-full pl-9 pr-10 py-2.5 bg-white border ${errors.confirmPassword ? 'border-red-400' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-[#354052] placeholder-[#667085]/60 text-sm outline-none transition-colors`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#667085] hover:text-[#354052]"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <div className="pt-2">
          <Button type="submit" isLoading={loading} variant="primary" className="btn-primary-pastel">
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChangePasswordCard;
