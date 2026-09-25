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
    <div className="glass-card p-5 sm:p-6 border border-white/10 rounded-2xl bg-white/[0.03]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Community Verification & Accuracy
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-world incidents are cross-referenced by local residents and civic participants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium">
            {totalReports} Community Response{totalReports === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Verification Query Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-white/10 mb-5">
        <p className="text-sm font-semibold text-white mb-3">
          Is this information still current and active near this location?
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleVerify('confirm')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Yes, I can confirm</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[10px]">
              {stats.confirmed_count || 0}
            </span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleVerify('unsure')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>I'm not sure / Outdated</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[10px]">
              {stats.unsure_count || 0}
            </span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => setShowUpdateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 border border-primary-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4 text-primary-400" />
            <span>I have a local update</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-500/20 text-[10px]">
              {stats.updates_count || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Aggregated Community Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-gray-400 block font-medium">Community Consensus</span>
          <p className="text-gray-200 leading-relaxed font-semibold">
            {stats.confirmed_count > stats.unsure_count
              ? `${stats.confirmed_count} users confirmed active conditions.`
              : stats.unsure_count > 0
              ? `${stats.unsure_count} user(s) noted the situation may have changed.`
              : 'Awaiting local community reports.'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-gray-400 block font-medium">Official Verification Status</span>
          <p className="text-amber-300 font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b112c] border border-white/15 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl"
            >
              <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-primary-400" />
                Share a Community Update
              </h4>
              <p className="text-xs text-gray-400 mb-4">
                Provide practical, real-world context (e.g. road accessibility, water levels, shelter locations).
              </p>

              <textarea
                rows={4}
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="Example: The main bypass is currently clear, local community hall is offering relief packets..."
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-500/20 outline-none resize-none mb-4"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || !updateText.trim()}
                  onClick={() => handleVerify('update', updateText.trim())}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-md"
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
