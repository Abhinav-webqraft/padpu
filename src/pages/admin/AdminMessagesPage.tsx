import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, Clock, RefreshCw } from "lucide-react";
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
    if (!window.confirm("Are you sure you want to delete this message?")) return;
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">User Messages</h1>
          <p className="text-gray-400">Read and manage inquiries from the contact form</p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
            <p className="text-gray-400 font-light">When users contact you, their messages will appear here.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border ${msg.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{msg.name}</h3>
                      {msg.status === 'resolved' && (
                        <span className="text-[10px] uppercase tracking-wider bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Resolved</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Mail className="w-3.5 h-3.5" />
                      {msg.email_or_phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    {msg.status !== 'resolved' && (
                      <button
                        onClick={() => markResolved(msg.id)}
                        className="text-xs px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-amber-500/20"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {msg.subject && (
                  <h4 className="text-amber-400 font-medium text-sm">Subject: {msg.subject}</h4>
                )}
                <p className="text-gray-300 font-light whitespace-pre-wrap">{msg.message}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
