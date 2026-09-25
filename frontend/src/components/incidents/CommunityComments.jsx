import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, CornerDownRight, ThumbsUp, Flag, Trash2, Edit2, 
  Send, ShieldCheck, User as UserIcon, AlertCircle, X, Check 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { eventService } from '../../services/eventService';
import Avatar from '../ui/Avatar';

const CommentItem = ({ 
  comment, 
  currentUser, 
  onReply, 
  onEdit, 
  onDelete, 
  onReport, 
  onHelpful,
  replyingId,
  replyText,
  setReplyText,
  onSubmitReply,
  editingId,
  editText,
  setEditText,
  onSubmitEdit,
  cancelEdit,
  cancelReply
}) => {
  const isOwner = currentUser && currentUser._id === comment.user_id;
  const isReplying = replyingId === comment._id;
  const isEditing = editingId === comment._id;

  const timeAgo = comment.created_at 
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) 
    : 'Just now';

  return (
    <div className="space-y-3">
      <div className={`p-4 rounded-2xl border transition-all ${
        comment.is_deleted 
          ? 'bg-white/[0.01] border-white/5 opacity-60' 
          : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/10'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <Avatar 
              src={comment.user_profile_image} 
              name={comment.user_name} 
              size="sm" 
              className="ring-1 ring-white/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-none">
                  {comment.user_name}
                </span>
                {comment.user_role === 'ngo' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    NGO Partner
                  </span>
                )}
                {comment.user_role === 'admin' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Moderator
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5 block">{timeAgo}</span>
            </div>
          </div>

          {/* Comment Action Icons */}
          {!comment.is_deleted && (
            <div className="flex items-center gap-1 text-gray-400">
              <button
                type="button"
                onClick={() => onHelpful(comment._id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 text-[11px] text-gray-300 transition-colors"
                title="Mark helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-primary-400" />
                <span>{comment.helpful_count || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => onReport(comment._id)}
                className="p-1 rounded-lg hover:bg-white/10 hover:text-rose-400 text-gray-400 transition-colors"
                title="Report comment"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(comment)}
                    className="p-1 rounded-lg hover:bg-white/10 hover:text-cyan-400 text-gray-400 transition-colors"
                    title="Edit comment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(comment._id)}
                    className="p-1 rounded-lg hover:bg-white/10 hover:text-rose-400 text-gray-400 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content or Edit Form */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              rows={2}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-primary-400 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-2.5 py-1 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSubmitEdit(comment._id)}
                className="px-3 py-1 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-xs sm:text-sm leading-relaxed ${
            comment.is_deleted ? 'italic text-gray-500' : 'text-gray-200'
          }`}>
            {comment.content}
          </p>
        )}

        {/* Reply Trigger */}
        {!comment.is_deleted && currentUser && !isReplying && (
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onReply(comment._id)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-400 hover:text-primary-300 transition-colors"
            >
              <CornerDownRight className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </div>
        )}

        {/* Inline Reply Box */}
        {isReplying && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user_name}...`}
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-primary-400"
              />
              <button
                type="button"
                onClick={cancelReply}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!replyText.trim()}
                onClick={() => onSubmitReply(comment._id)}
                className="px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1 shadow-sm"
              >
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 sm:pl-8 border-l-2 border-primary-500/20 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              currentUser={currentUser}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
              onHelpful={onHelpful}
              replyingId={replyingId}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={onSubmitReply}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              onSubmitEdit={onSubmitEdit}
              cancelEdit={cancelEdit}
              cancelReply={cancelReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommunityComments = ({ eventId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  // Replying & Editing state
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchComments = async () => {
    try {
      const res = await eventService.getComments(eventId);
      setComments(res?.data || []);
    } catch (err) {
      console.warn('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast('Please log in to participate in the community discussion.', { icon: '🔒' });
      return;
    }
    if (!newCommentText.trim()) return;

    setPosting(true);
    try {
      await eventService.addComment(eventId, { content: newCommentText.trim() });
      setNewCommentText('');
      toast.success('Comment posted to discussion');
      fetchComments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      await eventService.addComment(eventId, {
        content: replyText.trim(),
        parent_comment_id: parentId
      });
      setReplyingId(null);
      setReplyText('');
      toast.success('Reply submitted');
      fetchComments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reply');
    }
  };

  const handleEditSubmit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await eventService.updateComment(commentId, { content: editText.trim() });
      setEditingId(null);
      setEditText('');
      toast.success('Comment updated');
      fetchComments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to remove this comment?')) return;
    try {
      await eventService.deleteComment(commentId);
      toast.success('Comment removed');
      fetchComments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleReport = async (commentId) => {
    const reason = window.prompt('Please briefly specify why you are reporting this comment:');
    if (!reason || !reason.trim()) return;

    try {
      await eventService.reportComment(commentId, { reason: reason.trim() });
      toast.success('Thank you. Comment flagged for community review.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report comment');
    }
  };

  const handleHelpful = async (commentId) => {
    if (!currentUser) {
      toast('Please log in to vote on comments.', { icon: '🔒' });
      return;
    }
    try {
      const res = await eventService.toggleHelpful(commentId);
      toast.success(res?.message || 'Helpful feedback recorded');
      fetchComments();
    } catch (err) {
      toast.error('Could not update helpful vote');
    }
  };

  return (
    <div className="glass-card p-5 sm:p-6 border border-white/10 rounded-2xl bg-white/[0.03]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-400" />
          Community Discussion ({comments.length})
        </h3>
        <span className="text-xs text-gray-400">Threaded replies supported</span>
      </div>

      {/* Main Comment Box */}
      {currentUser ? (
        <form onSubmit={handleCreateComment} className="mb-6">
          <div className="flex gap-3">
            <Avatar 
              src={currentUser.profileImage} 
              name={currentUser.name} 
              size="md" 
              className="hidden sm:block shrink-0 mt-1"
            />
            <div className="flex-1 space-y-2">
              <textarea
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add your observation, question, or situational update..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-500/20 outline-none resize-none transition-all"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={posting || !newCommentText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{posting ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center mb-6">
          <p className="text-xs text-gray-300">
            Join the conversation. Please <a href="/login" className="text-primary-400 underline font-semibold">log in</a> to post comments or reply to others.
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">
          Loading community comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/10">
          <p className="text-xs text-gray-400">
            No comments yet. Be the first to share local context or ask a question!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={currentUser}
              onReply={(id) => {
                setReplyingId(id);
                setReplyText('');
              }}
              onEdit={(c) => {
                setEditingId(c._id);
                setEditText(c.content);
              }}
              onDelete={handleDelete}
              onReport={handleReport}
              onHelpful={handleHelpful}
              replyingId={replyingId}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={handleReplySubmit}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              onSubmitEdit={handleEditSubmit}
              cancelEdit={() => setEditingId(null)}
              cancelReply={() => setReplyingId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityComments;
