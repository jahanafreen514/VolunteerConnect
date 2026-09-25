import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle2, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import PublicLayout from '../layouts/PublicLayout';
import { contactService } from '../services/contactService';
import FloatingCard from '../components/visual/FloatingCard';
import Floating from '../components/animations/Floating';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await contactService.sendMessage(data);
      setSubmitted(true);
      toast.success('Your message has been sent successfully!');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="relative min-h-screen pt-6 pb-14 overflow-hidden bg-transparent text-slate-800 dark:text-slate-100 transition-colors duration-300">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/25 text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-4 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              <span>Get In Touch</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
              We'd Love to <span className="gradient-text">Hear from You</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-lg text-slate-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto"
            >
              Have a question about volunteering, NGO onboarding, or platform features? Our dedicated team is here to support your mission.
            </motion.p>
          </div>

          {/* Grid Layout: Left Info, Right Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Contact Cards */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="glass-card p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-300/10 dark:bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Email Us</h4>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mt-0.5">support@volunteerconnect.com</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">Typical response time: &lt; 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-500/20 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Support Hours</h4>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mt-0.5">Monday – Friday: 9:00 AM – 6:00 PM (EST)</p>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Weekend support for active events</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-500/20 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">NGO Onboarding & Verification</h4>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mt-0.5">verification@volunteerconnect.com</p>
                      <p className="text-xs text-accent-600 dark:text-accent-400 mt-1">Expedited 48-hour document review</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                  <Floating distance={6} duration={5}>
                    <FloatingCard
                      icon={Sparkles}
                      iconColor="text-primary-600 bg-primary-50 dark:text-primary-300 dark:bg-primary-500/20 border-primary-200 dark:border-primary-500/30"
                      title="Direct Support"
                      subtitle="Community-first service"
                      badge="Active"
                    />
                  </Floating>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-7"
            >
              <div className="glass-card p-8 md:p-10 border border-slate-200/80 dark:border-white/10 shadow-lg dark:shadow-2xl relative">
                {submitted ? (
                  <div className="text-center py-12 space-y-5">
                    <div className="w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400 flex items-center justify-center mx-auto border border-accent-200 dark:border-accent-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Message Received!</h3>
                    <p className="text-slate-600 dark:text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for contacting VolunteerConnect. Our team has received your message and will respond to your email shortly.
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => setSubmitted(false)}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-sm"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Your Name</label>
                        <input
                          type="text"
                          {...register('name')}
                          placeholder="Jane Doe"
                          className={`w-full px-4 py-3 bg-white/80 dark:bg-white/[0.05] border ${errors.name ? 'border-red-400' : 'border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 text-sm outline-none transition-all`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          {...register('email')}
                          placeholder="jane@example.com"
                          className={`w-full px-4 py-3 bg-white/80 dark:bg-white/[0.05] border ${errors.email ? 'border-red-400' : 'border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 text-sm outline-none transition-all`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Subject</label>
                      <input
                        type="text"
                        {...register('subject')}
                        placeholder="Inquiry about NGO verification / volunteering..."
                        className={`w-full px-4 py-3 bg-white/80 dark:bg-white/[0.05] border ${errors.subject ? 'border-red-400' : 'border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 text-sm outline-none transition-all`}
                      />
                      {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Message</label>
                      <textarea
                        rows={5}
                        {...register('message')}
                        placeholder="How can we help your volunteering or organization goals? Share details here..."
                        className={`w-full px-4 py-3 bg-white/80 dark:bg-white/[0.05] border ${errors.message ? 'border-red-400' : 'border-slate-200 dark:border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 text-sm outline-none transition-all resize-none`}
                      />
                      {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl btn-glow transition-all shadow-sm"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Contact;
