import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, HelpCircle, MessageSquarePlus, ThumbsUp, ShieldAlert, Sparkles, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../services/eventService';

const CommunityVerification = ({ eventId, verificationData, status, onUpdated, isAuthenticated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateText, setUpdateText] = useState('');

  const stats = verificationData || {
    confirmed_count: 0,
    unsure_count: 0,
    updates_count: 0,
    helpful_count: 0,
    responses: []
  };

  const handleVerify = async (type, commentText = '') => {
    if (!isAuthenticated) {
      toast('Please log in to submit a community verification report.', { icon: '🔒' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await eventService.verifyEvent(eventId, {
        response_type: type,
        comment: commentText
      });
      toast.success(res?.message || 'Thank you! Your report has been aggregated.');
      setShowUpdateModal(false);
      setUpdateText('');
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const totalReports = (stats.confirmed_count || 0) + (stats.unsure_count || 0) + (stats.updates_count || 0);

  return (
    <div className="pastel-card p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#354052] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B87033]" />
            Community Verification & Accuracy
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-world incidents are cross-referenced by local residents and civic participants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-3 py-1 rounded-full bg-[#F5F1FA] border border-[#E6E8EC] text-[#354052] font-semibold">
            {totalReports} Community Response{totalReports === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Verification Query Card */}
      <div className="p-4 rounded-2xl bg-[#FFF8EF] border border-[#F6D8C5] mb-5">
        <p className="text-sm font-bold text-[#354052] mb-3">
          Is this information still current and active near this location?
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleVerify('confirm')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D8EEE5] hover:bg-[#BFD8C2] text-[#26372B] border border-[#BFD8C2] text-xs font-semibold transition-all shadow-soft-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-[#4D8256]" />
            <span>Yes, I can confirm</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/80 text-[10px] font-bold">
              {stats.confirmed_count || 0}
            </span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleVerify('unsure')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F6D8C5]/50 hover:bg-[#F6D8C5] text-[#854D27] border border-[#F6D8C5] text-xs font-semibold transition-all shadow-soft-sm disabled:opacity-50"
          >
            <HelpCircle className="w-4 h-4 text-[#B87033]" />
            <span>I'm not sure / Outdated</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/80 text-[10px] font-bold">
              {stats.unsure_count || 0}
            </span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => setShowUpdateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9DDF2]/50 hover:bg-[#C9DDF2] text-[#28486D] border border-[#C9DDF2] text-xs font-semibold transition-all shadow-soft-sm disabled:opacity-50"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#28486D]" />
            <span>I have a local update</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/80 text-[10px] font-bold">
              {stats.updates_count || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Aggregated Community Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-[#E6E8EC] space-y-1 shadow-soft-sm">
          <span className="text-[#667085] block font-medium">Community Consensus</span>
          <p className="text-[#354052] leading-relaxed font-semibold">
            {stats.confirmed_count > stats.unsure_count
              ? `${stats.confirmed_count} users confirmed active conditions.`
              : stats.unsure_count > 0
              ? `${stats.unsure_count} user(s) noted the situation may have changed.`
              : 'Awaiting local community reports.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E6E8EC] space-y-1 shadow-soft-sm">
          <span className="text-[#667085] block font-medium">Official Verification Status</span>
          <p className="text-[#854D27] font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#B87033]" />
            <span>
              {status === 'NGO_CONFIRMED' || status === 'confirmed'
                ? 'Confirmed by Registered Non-Profit'
                : 'Community Sourced (Official Verification Pending)'}
            </span>
          </p>
        </div>
      </div>

      {/* Update Submission Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E6E8EC] rounded-2xl p-6 w-full max-w-md shadow-soft-hover"
            >
              <h4 className="text-base font-bold text-[#354052] mb-1 flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-[#28486D]" />
                Share a Community Update
              </h4>
              <p className="text-xs text-[#667085] mb-4">
                Provide practical, real-world context (e.g. road accessibility, water levels, shelter locations).
              </p>

              <textarea
                rows={4}
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="Example: The main bypass is currently clear, local community hall is offering relief packets..."
                className="w-full bg-[#F5F1FA]/60 border border-[#E6E8EC] rounded-xl p-3 text-xs text-[#354052] placeholder-[#667085] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 outline-none resize-none mb-4"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-[#667085] hover:text-[#354052] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || !updateText.trim()}
                  onClick={() => handleVerify('update', updateText.trim())}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#AFCDB5] hover:bg-[#9EBEA4] text-[#26372B] text-xs font-semibold disabled:opacity-50 transition-all shadow-soft-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Update</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityVerification;
