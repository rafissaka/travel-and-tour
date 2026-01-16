'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, User, Bot, UserCircle, Loader2, Power, PowerOff, Clock, CheckCheck, Search, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import PageLoader from '@/app/components/PageLoader';

interface Conversation {
  id: string;
  userId?: string;
  visitorName?: string;
  visitorEmail?: string;
  status: string;
  isAdminOnline: boolean;
  lastMessageAt?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  messages: Array<{
    id: string;
    message: string;
    sender: string;
    createdAt: string;
  }>;
  _count: {
    messages: number;
  };
}

interface Message {
  id: string;
  conversationId: string;
  sender: 'USER' | 'ADMIN' | 'AI';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAdminStatus();
    fetchConversations();

    // Poll for new messages and conversations
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    }, 3000);

    // Send heartbeat every 30 seconds to stay online
    const heartbeat = setInterval(() => {
      if (isOnline) {
        sendHeartbeat();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(heartbeat);
    };
  }, [selectedConversation, isOnline]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchAdminStatus = async () => {
    try {
      const response = await fetch('/api/chat/admin/status');
      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.isOnline);
      }
    } catch (error) {
      console.error('Error fetching admin status:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const response = await fetch('/api/chat/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: !isOnline }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.isOnline);
        toast.success(`You are now ${data.isOnline ? 'online' : 'offline'}`);
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      toast.error('Failed to update status');
    }
  };

  const sendHeartbeat = async () => {
    try {
      await fetch('/api/chat/admin/status', {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);

        // Mark messages as read
        await fetch('/api/chat/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId }),
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/chat/messages?adminSending=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          message: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation);
        fetchConversations();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.user) {
      return `${conv.user.firstName || ''} ${conv.user.lastName || ''}`.trim() || conv.user.email;
    }
    return conv.visitorName || conv.visitorEmail || 'Guest';
  };

  const getConversationEmail = (conv: Conversation) => {
    return conv.user?.email || conv.visitorEmail || '';
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'USER':
        return <User className="w-4 h-4 text-white" />;
      case 'ADMIN':
        return <UserCircle className="w-4 h-4 text-white" />;
      case 'AI':
        return <Bot className="w-4 h-4 text-white" />;
      default:
        return <User className="w-4 h-4 text-white" />;
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'USER':
        return 'bg-primary';
      case 'ADMIN':
        return 'bg-green-500';
      case 'AI':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const name = getConversationName(conv).toLowerCase();
    const email = getConversationEmail(conv).toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  if (isLoading) {
    return <PageLoader text="Loading conversations..." />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Chat Support</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer conversations</p>
        </div>
        <motion.button
          onClick={toggleOnlineStatus}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base w-full sm:w-auto justify-center ${
            isOnline
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          {isOnline ? (
            <>
              <Power className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Online</span>
            </>
          ) : (
            <>
              <PowerOff className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Offline</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-1 h-[calc(100vh-280px)] lg:h-[calc(100vh-140px)] min-h-[500px]">
        {/* Conversations List - Hide on mobile when chat is selected */}
        <div className={`lg:col-span-1 bg-white dark:bg-[#111b21] border-r border-[#e9edef] dark:border-[#2a2f32] overflow-hidden flex flex-col h-full ${
          selectedConversation ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* WhatsApp Header */}
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 flex-shrink-0">
            <h2 className="text-foreground font-semibold text-lg mb-3">Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#667781] dark:text-[#8696a0]" />
              <input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#2a3942] border-none rounded-lg text-foreground placeholder:text-[#667781] dark:placeholder:text-[#8696a0] focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-[#111b21] scrollbar-hide">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-[#667781] dark:text-[#8696a0]">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-left px-4 py-3 transition-colors border-b border-[#e9edef] dark:border-[#2a2f32] ${
                      selectedConversation === conv.id
                        ? 'bg-[#f0f2f5] dark:bg-[#2a3942]'
                        : 'hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[#d9d9d9] dark:bg-[#6a7175] flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h3 className="font-medium text-[#111b21] dark:text-[#e9edef] truncate text-base">
                            {getConversationName(conv)}
                          </h3>
                          <span className="text-xs text-[#667781] dark:text-[#8696a0] flex-shrink-0">
                            {new Date(conv.lastMessageAt || conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          {conv.messages[0] && (
                            <p className="text-sm text-[#667781] dark:text-[#8696a0] truncate flex-1">
                              {conv.messages[0].sender === 'ADMIN' && <CheckCheck className="w-4 h-4 inline mr-1 text-[#53bdeb]" />}
                              {conv.messages[0].message}
                            </p>
                          )}
                          {conv._count.messages > 0 && (
                            <span className="px-1.5 py-0.5 bg-[#25d366] text-white text-xs rounded-full flex-shrink-0 min-w-[20px] text-center">
                              {conv._count.messages}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area - Show full screen on mobile when chat is selected */}
        <div className={`lg:col-span-2 bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden flex flex-col h-full ${
          selectedConversation ? 'flex' : 'hidden lg:flex'
        }`}>
          {selectedConv ? (
            <>
              {/* Chat Header - WhatsApp Style */}
              <div className="px-4 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center gap-3 flex-shrink-0 border-b border-[#e9edef] dark:border-[#2a2f32]">
                {/* Back button - only visible on mobile */}
                <button
                  onClick={handleBackToList}
                  className="lg:hidden p-2 -ml-2 hover:bg-[#d9d9d9] dark:hover:bg-[#2a3942] rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#667781] dark:text-[#8696a0]" />
                </button>
                
                <div className="w-10 h-10 rounded-full bg-[#d9d9d9] dark:bg-[#6a7175] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#111b21] dark:text-[#e9edef] truncate text-base">{getConversationName(selectedConv)}</h3>
                  <p className="text-xs text-[#667781] dark:text-[#8696a0] truncate">online</p>
                </div>
              </div>

              {/* Messages - WhatsApp Background Pattern */}
              <div 
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 min-h-0 scrollbar-hide"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`relative max-w-[85%] sm:max-w-[65%] ${
                      msg.sender === 'ADMIN'
                        ? 'bg-[#d9fdd3] dark:bg-[#005c4b]'
                        : msg.sender === 'AI'
                        ? 'bg-[#e7d4ff] dark:bg-[#4a148c]'
                        : 'bg-white dark:bg-[#202c33]'
                    } rounded-lg shadow-sm px-3 py-2`}>
                      {/* Tail */}
                      <div className={`absolute top-0 ${
                        msg.sender === 'ADMIN' 
                          ? 'right-0 -mr-2' 
                          : 'left-0 -ml-2'
                      }`}>
                        <svg width="8" height="13" viewBox="0 0 8 13">
                          <path 
                            d={msg.sender === 'ADMIN' 
                              ? "M1.533,3.568 L8.009,0.011 L8.009,12.223 C7.574,11.464 6.659,10.663 5.409,10.433 C3.701,10.117 1.533,10.263 1.533,3.568 Z"
                              : "M5.9,0.011 L0.009,3.568 C0.009,10.263 2.177,10.117 3.885,10.433 C5.135,10.663 6.05,11.464 6.485,12.223 L5.9,0.011 Z"
                            }
                            fill={msg.sender === 'ADMIN' 
                              ? (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#005c4b' : '#d9fdd3')
                              : msg.sender === 'AI'
                              ? (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#4a148c' : '#e7d4ff')
                              : (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#202c33' : '#ffffff')
                            }
                          />
                        </svg>
                      </div>
                      
                      {/* Sender Badge for non-admin */}
                      {msg.sender !== 'ADMIN' && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs font-semibold text-[#00a884] dark:text-[#25d366]">
                            {msg.sender === 'AI' ? '🤖 AI Assistant' : '👤 User'}
                          </span>
                        </div>
                      )}
                      
                      {/* Message Text */}
                      <p className={`text-sm break-words ${
                        msg.sender === 'ADMIN'
                          ? 'text-[#111b21] dark:text-[#e9edef]'
                          : 'text-[#111b21] dark:text-[#e9edef]'
                      }`}>
                        {msg.message}
                      </p>
                      
                      {/* Time and Status */}
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        msg.sender === 'ADMIN' ? '' : ''
                      }`}>
                        <span className="text-[11px] text-[#667781] dark:text-[#8696a0]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.sender === 'ADMIN' && (
                          <CheckCheck className={`w-4 h-4 ${
                            msg.isRead ? 'text-[#53bdeb]' : 'text-[#667781] dark:text-[#8696a0]'
                          }`} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input - WhatsApp Style */}
              <form onSubmit={handleSendMessage} className="px-3 sm:px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] flex-shrink-0 border-t border-[#e9edef] dark:border-[#2a2f32]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-[#2a3942] border-none rounded-lg text-[#111b21] dark:text-[#e9edef] placeholder:text-[#667781] dark:placeholder:text-[#8696a0] focus:outline-none text-sm disabled:opacity-50"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!newMessage.trim() || isSending}
                    className="p-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full transition-all disabled:opacity-50 disabled:bg-[#667781] disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0b141a] border-l border-[#e9edef] dark:border-[#2a2f32]">
              <div className="text-center px-8">
                <div className="w-80 h-80 mx-auto mb-8 relative">
                  <svg viewBox="0 0 303 172" className="w-full h-full opacity-10 dark:opacity-5">
                    <path fill="currentColor" d="M98.793 60.941a7.886 7.886 0 0 0-7.886 7.886v94.307a7.886 7.886 0 0 0 7.886 7.886h94.307a7.886 7.886 0 0 0 7.886-7.886V68.827a7.886 7.886 0 0 0-7.886-7.886H98.793zm0 0" />
                  </svg>
                </div>
                <h1 className="text-3xl font-light text-[#41525d] dark:text-[#8696a0] mb-3">WhatsApp Web</h1>
                <p className="text-sm text-[#667781] dark:text-[#8696a0] max-w-md mx-auto leading-relaxed">
                  Send and receive messages with customers. Select a chat to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
