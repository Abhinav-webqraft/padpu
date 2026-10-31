import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, Clock, RefreshCw, CheckCircle2, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface ContactMessage {
  id: number;
  user_id: number;
  name: string;
  email_or_phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'resolved';
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, status: 'resolved' } : m));
      }
    } catch (error) {
      console.error("Failed to mark resolved", error);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [token]);

  const filtered = filter === 'all' ? messages : messages.filter(m => m.status === filter);
  const unreadCount = messages.filter(m => m.status !== 'resolved').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Support Inbox</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-0.5">Messages</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            {(['all', 'unread', 'resolved'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === tab
                    ? 'amber-gradient text-stone-950'
                    : 'text-stone-400 hover:text-white'
                  }`}
              >
                {tab}
                {tab === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 font-sans">({unreadCount})</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={fetchMessages}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 rounded-xl transition-colors border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs">Loading messages...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.03] rounded-3xl border border-white/10">
          <MessageCircle className="w-10 h-10 text-stone-600 mx-auto mb-2.5" />
          <h3 className="text-sm font-semibold text-white">No inquiries found</h3>
          <p className="text-stone-500 text-xs mt-0.5">Customer messages from the Contact page appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${msg.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-sm truncate">{msg.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${msg.status === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5 truncate">
                      <Mail className="w-3 h-3 text-amber-400/70 shrink-0" />
                      {msg.email_or_phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-stone-500 font-sans">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {msg.status !== 'resolved' && (
                      <button
                        onClick={() => markResolved(msg.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors border border-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/20"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {msg.subject && (
                  <p className="text-amber-400 font-semibold text-xs">{msg.subject}</p>
                )}
                <p className="text-stone-300 font-light text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
