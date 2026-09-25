import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Users, ShieldAlert, LogIn, LogOut, 
  Flag, Ban, AlertCircle, CheckCircle2, ChevronDown, ChevronUp 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { eventService } from '../../services/eventService';

const CommunityChat = ({ eventId, eventTitle, currentUser }) => {
  const { socket } = useSocket();
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vc_blocked_users') || '[]');
    } catch {
      return [];
    }
  });

  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (joined && socket) {
      socket.emit('join_event_chat', eventId);

      const handleNewMessage = (newMsg) => {
        if (newMsg.event_id?.toString() === eventId?.toString()) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(scrollToBottom, 50);
        }
      };

      socket.on('new_event_message', handleNewMessage);

      return () => {
        socket.emit('leave_event_chat', eventId);
        socket.off('new_event_message', handleNewMessage);
      };
    }
  }, [joined, socket, eventId]);

  const loadChatMessages = async () => {
    setLoading(true);
    try {
      const res = await eventService.getChatMessages(eventId);
      setMessages(res?.data?.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.warn('Failed to load chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChat = async () => {
    if (!currentUser) {
      toast('Please log in to join the incident community chat.', { icon: '🔒' });
      return;
    }
    try {
      await eventService.joinChat(eventId);
      setJoined(true);
      await loadChatMessages();
      toast.success('Joined incident live chat');
    } catch (err) {
      toast.error('Could not join chat discussion');
    }
  };

  const handleLeaveChat = async () => {
    try {
      await eventService.leaveChat(eventId);
      setJoined(false);
      toast('Left incident chat', { icon: '👋' });
    } catch (err) {
      setJoined(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const messageContent = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await eventService.sendMessage(eventId, { content: messageContent });
      const savedMsg = res?.data;
      if (savedMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === savedMsg._id)) return prev;
          return [...prev, savedMsg];
        });
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
      setInputText(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleReportMessage = async (messageId) => {
    const reason = window.prompt('Specify reason for reporting this message:');
    if (!reason || !reason.trim()) return;

    try {
      await eventService.reportMessage(messageId, { reason: reason.trim() });
      toast.success('Message reported to administrators for moderation');
    } catch (err) {
      toast.error('Failed to report message');
    }
  };

  const handleBlockUser = (userId, userName) => {
    if (window.confirm(`Block ${userName}? You will no longer see messages sent by this user in this conversation.`)) {
      const updated = [...blockedUsers, userId];
      setBlockedUsers(updated);
      localStorage.setItem('vc_blocked_users', JSON.stringify(updated));
      toast(`Blocked ${userName}`);
    }
  };

  const visibleMessages = messages.filter(
    (m) => !blockedUsers.includes(m.sender_id) && !m.is_deleted
  );

  return (
    <div className="glass-card p-5 sm:p-6 border border-white/10 rounded-2xl bg-white/[0.03]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-accent-400" />
            Live Incident Communication
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time coordination room for volunteers, responders, and nearby community members.
          </p>
        </div>

        {joined ? (
          <button
            type="button"
            onClick={handleLeaveChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Chat</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleJoinChat}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-600 to-primary-600 hover:from-accent-500 hover:to-primary-500 text-white text-xs font-semibold transition-all shadow-md shadow-primary-600/20 hover:scale-105 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Join Community Discussion</span>
          </button>
        )}
      </div>

      {!joined ? (
        <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 p-6">
          <MessageCircle className="w-10 h-10 text-accent-400/50 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">
            Real-Time Community Channel
          </h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto mb-4 leading-relaxed">
            Connect directly with other volunteers and responders focused on this specific incident. Discuss relief progress, check logistics, and avoid duplicated efforts.
          </p>
          <button
            type="button"
            onClick={handleJoinChat}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Open Incident Chat</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Moderation Advisory Banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Civic Safety:</strong> Keep discussions helpful and constructive. Do not share unverified rumours or personal phone numbers. Inappropriate messages will be moderated.
            </span>
          </div>

          {/* Messages Stream */}
          <div
            ref={chatContainerRef}
            className="h-80 overflow-y-auto pr-2 space-y-3 custom-scrollbar rounded-2xl bg-[#060a22]/70 p-4 border border-white/5"
          >
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Loading messages...
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-gray-500 text-center">
                <p>No messages yet in this room.</p>
                <p className="text-[11px] text-gray-600 mt-1">Start by asking a question or sharing what you know.</p>
              </div>
            ) : (
              visibleMessages.map((msg) => {
                const isMe = currentUser && (msg.sender_id === currentUser._id || msg.sender_id === currentUser.id);
                const timeAgo = msg.created_at
                  ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })
                  : '';

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1 px-1">
                      <span className="font-semibold text-gray-300">
                        {isMe ? 'You' : msg.sender_name}
                      </span>
                      {msg.sender_role === 'ngo' && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300">
                          NGO
                        </span>
                      )}
                      {msg.sender_role === 'admin' && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-purple-500/20 text-purple-300">
                          Admin
                        </span>
                      )}
                      <span>· {timeAgo}</span>
                    </div>

                    <div
                      className={`relative max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-white/[0.07] text-gray-100 rounded-bl-sm border border-white/10'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                      {/* Moderation Controls for Other Users' Messages */}
                      {!isMe && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 -right-16 flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded-lg border border-white/10 text-gray-400">
                          <button
                            type="button"
                            onClick={() => handleReportMessage(msg._id)}
                            className="hover:text-rose-400 p-0.5"
                            title="Report message"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBlockUser(msg.sender_id, msg.sender_name)}
                            className="hover:text-amber-400 p-0.5"
                            title="Block user"
                          >
                            <Ban className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message to room... (Press Enter to send)"
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunityChat;
