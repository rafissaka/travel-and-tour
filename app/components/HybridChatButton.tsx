'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, UserCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'USER' | 'ADMIN' | 'AI';
  time: string;
  isRead?: boolean;
}

export function HybridChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    'Educational Services',
    'Study Abroad Programs',
    'Travel & Tours',
    'Visa Assistance',
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check if user is admin on mount
  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const userIsAdmin = data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN';
          setIsAdmin(userIsAdmin);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkIfAdmin();
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          // User is authenticated, they can chat directly
          setShowGuestForm(false);
        } else {
          // Guest user, need name and email
          setShowGuestForm(true);
        }
      } catch (error) {
        setShowGuestForm(true);
      }
    };

    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  // Poll for new messages
  useEffect(() => {
    if (!conversationId || !isOpen) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
        if (response.ok) {
          const data = await response.json();
          const formattedMessages = data.map((msg: any) => ({
            id: msg.id,
            text: msg.message,
            sender: msg.sender,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: msg.isRead,
          }));

          // Only update if messages changed to avoid duplicates
          setMessages(prev => {
            const prevIds = new Set(prev.map(m => m.id));
            const newIds = new Set(formattedMessages.map((m: Message) => m.id));
            const hasChanged = prev.length !== formattedMessages.length ||
                             !formattedMessages.every((m: Message) => prevIds.has(m.id));
            return hasChanged ? formattedMessages : prev;
          });
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Initial load
    pollMessages();

    // Poll every 3 seconds
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId, isOpen]);

  const startConversation = async (initialMessage: string) => {
    if (!showGuestForm || (visitorName && visitorEmail)) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: initialMessage,
            visitorName: showGuestForm ? visitorName : undefined,
            visitorEmail: showGuestForm ? visitorEmail : undefined,
          }),
        });

        if (response.ok) {
          const conversation = await response.json();
          setConversationId(conversation.id);
          setMessage('');
          toast.success('Chat started! We\'ll respond shortly.');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to start conversation');
        }
      } catch (error) {
        console.error('Error starting conversation:', error);
        toast.error('Failed to start conversation');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please enter your name and email to continue');
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || message;
    if (!messageText.trim()) return;

    // If no conversation exists, start one
    if (!conversationId) {
      await startConversation(messageText);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: messageText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('');

        // Let polling handle message updates to avoid duplicates
        // Just update admin status
        if (data.aiResponse) {
          setIsAdminOnline(false);
        } else {
          setIsAdminOnline(true);
        }
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const getSenderIcon = (sender: 'USER' | 'ADMIN' | 'AI') => {
    switch (sender) {
      case 'USER':
        return <User className="w-4 h-4 text-white" />;
      case 'ADMIN':
        return <UserCircle className="w-4 h-4 text-white" />;
      case 'AI':
        return <Bot className="w-4 h-4 text-white" />;
    }
  };

  const getSenderColor = (sender: 'USER' | 'ADMIN' | 'AI') => {
    switch (sender) {
      case 'USER':
        return 'bg-primary';
      case 'ADMIN':
        return 'bg-green-500';
      case 'AI':
        return 'bg-purple-500';
    }
  };

  // Don't show chat button for admin users
  if (checkingAuth) {
    return null; // Don't show anything while checking
  }

  if (isAdmin) {
    return null; // Hide chat button for admin users
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 px-6 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3"
        whileHover={{ scale: 1.05, gap: '1rem' }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: isOpen ? 1000 : 0,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
          Chat with us
        </span>

        {/* Pulse Animation */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 bg-primary rounded-full -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md"
          >
            <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[80vh] mx-4 sm:mx-0">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-primary via-secondary to-accent p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      isAdminOnline ? 'bg-green-400' : 'bg-purple-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Godfirst Support</h3>
                    <p className="text-white/80 text-xs">
                      {isAdminOnline ? 'Admin Online' : 'AI Assistant Active'}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ rotate: 90 }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Guest Info Form */}
              {showGuestForm && !conversationId && (
                <div className="p-4 bg-muted/30 border-b border-border">
                  <p className="text-sm text-muted-foreground mb-3">Please introduce yourself:</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-semibold mb-1">Welcome to Godfirst Support!</p>
                    <p className="text-sm text-muted-foreground">
                      How can we help you today?
                    </p>
                  </div>
                )}
                
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getSenderColor(msg.sender)}`}>
                        {getSenderIcon(msg.sender)}
                      </div>
                      <div>
                        <div className={`rounded-2xl px-4 py-2 ${
                          msg.sender === 'USER'
                            ? 'bg-primary text-white rounded-tr-none'
                            : msg.sender === 'ADMIN'
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-tl-none'
                            : 'bg-card border border-border rounded-tl-none'
                        }`}>
                          <p className={`text-sm ${
                            msg.sender === 'USER' ? 'text-white' : 'text-foreground'
                          }`}>
                            {msg.text}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs text-muted-foreground ${msg.sender === 'USER' ? 'text-right' : 'text-left'}`}>
                            {msg.time}
                          </p>
                          {msg.sender !== 'USER' && (
                            <span className="text-xs text-muted-foreground">
                              • {msg.sender === 'ADMIN' ? 'Admin' : 'AI'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 items-center bg-card border border-border rounded-2xl px-4 py-3 rounded-tl-none">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Typing...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length === 0 && !conversationId && (
                <div className="px-4 py-3 border-t border-border bg-background">
                  <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSendMessage(reply)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        {reply}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-background">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading || (showGuestForm && !conversationId && (!visitorName || !visitorEmail))}
                    className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-gradient-to-r from-primary via-secondary to-accent text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!message.trim() || isLoading || (showGuestForm && !conversationId && (!visitorName || !visitorEmail))}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </motion.button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {isAdminOnline ? 'Admin will respond shortly' : 'Powered by AI • Admin may join anytime'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
