import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, MessageSquare, Send, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import PublicLayout from '../layouts/PublicLayout';
import { contactService } from '../services/contactService';

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
      <div className="relative text-[#354052] bg-transparent py-8 sm:py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E6E8EC] shadow-soft-sm mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-[#54947f]" />
              <span className="text-xs font-semibold text-[#26372B]">Get In Touch</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#26372B] tracking-tight">
              We'd Love to <span className="text-[#556e5a]">Hear From You</span>
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#667085] leading-relaxed">
              Have questions about volunteering, NGO verification, or platform features? Our dedicated team is here to support you.
            </p>
          </div>

          {/* Grid Layout: Left Info + Photo, Right Form (Requirement 19) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Contact info & small supporting photograph */}
            <div className="lg:col-span-5 space-y-5">
              <div className="glass-card p-6 sm:p-7 border border-[#E6E8EC]">
                <h3 className="text-lg font-bold text-[#26372B] mb-5">Contact Information</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#26372B]">Email Us</h4>
                      <p className="text-xs text-[#667085] mt-0.5">support@volunteerconnect.com</p>
                      <p className="text-[11px] text-[#556e5a] font-medium mt-0.5">Response time: &lt; 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#C9DDF2] text-[#24426b] border-[#a3c5eb] shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#26372B]">Support Hours</h4>
                      <p className="text-xs text-[#667085] mt-0.5">Monday – Friday: 9:00 AM – 6:00 PM EST</p>
                      <p className="text-[11px] text-[#667085] mt-0.5">Weekend monitoring for active live events</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#DDD5F3] text-[#4d387a] border-[#c5b8eb] shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#26372B]">NGO Verification Help</h4>
                      <p className="text-xs text-[#667085] mt-0.5">verification@volunteerconnect.com</p>
                      <p className="text-[11px] text-[#7556bf] font-medium mt-0.5">48-hour document review team</p>
                    </div>
                  </div>
                </div>

                {/* Requirement 19: Small supporting real-world image */}
                <div className="mt-6 pt-5 border-t border-[#E6E8EC]">
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-[#E6E8EC] bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80"
                      alt="Volunteer support and community coordination"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-3 text-[11px] font-semibold text-white">
                      Community Helpdesk & Support Team
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="glass-card p-6 sm:p-8 border border-[#E6E8EC] shadow-soft-md">
                {submitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] flex items-center justify-center mx-auto shadow-soft-sm">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#26372B]">Message Sent!</h3>
                    <p className="text-xs sm:text-sm text-[#667085] max-w-sm mx-auto leading-relaxed">
                      Thank you for reaching out to VolunteerConnect. Our team has received your message and will respond shortly.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setSubmitted(false)}
                        className="btn-primary-pastel px-5 py-2.5 rounded-xl text-xs sm:text-sm"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#354052] mb-1.5">Your Name</label>
                        <input
                          type="text"
                          {...register('name')}
                          placeholder="e.g. Maya Patel"
                          className={`w-full px-3.5 py-2.5 bg-white border ${errors.name ? 'border-[#F2D6DD] focus:ring-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#354052] mb-1.5">Email Address</label>
                        <input
                          type="email"
                          {...register('email')}
                          placeholder="maya@example.com"
                          className={`w-full px-3.5 py-2.5 bg-white border ${errors.email ? 'border-[#F2D6DD] focus:ring-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#354052] mb-1.5">Subject</label>
                      <input
                        type="text"
                        {...register('subject')}
                        placeholder="Inquiry regarding NGO verification / opportunity questions..."
                        className={`w-full px-3.5 py-2.5 bg-white border ${errors.subject ? 'border-[#F2D6DD] focus:ring-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all shadow-soft-sm`}
                      />
                      {errors.subject && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#354052] mb-1.5">Message</label>
                      <textarea
                        rows={5}
                        {...register('message')}
                        placeholder="How can our community team assist your goals? Describe your question or feedback..."
                        className={`w-full px-3.5 py-2.5 bg-white border ${errors.message ? 'border-[#F2D6DD] focus:ring-[#F2D6DD]' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'} rounded-xl text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all resize-none shadow-soft-sm`}
                      />
                      {errors.message && <p className="mt-1 text-xs text-[#8C3B4A]">{errors.message.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary-pastel inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-[#26372B] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Contact;
