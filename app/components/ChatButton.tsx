'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { useState } from 'react';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; time: string }>>([
    {
      text: 'Hello! Welcome to Godfirst Education and Tours. How can we help you today?',
      isUser: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickReplies = [
    'Educational Services',
    'Travel & Tours',
    'Visa Assistance',
    'Book a Consultation'
  ];

  const handleSendMessage = (text?: string) => {
    const messageText = text || message;
    if (!messageText.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    setMessages([...messages, { text: messageText, isUser: true, time: currentTime }]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      let response = '';
      const lowerMessage = messageText.toLowerCase();

      if (lowerMessage.includes('education') || lowerMessage.includes('study')) {
        response = 'Great! We offer comprehensive educational consulting services including university admissions, scholarship applications, and study abroad guidance. Would you like to schedule a free consultation?';
      } else if (lowerMessage.includes('travel') || lowerMessage.includes('tour')) {
        response = 'Wonderful! We organize amazing tours across Ghana and international destinations. We can help with flight bookings, hotel reservations, and custom itineraries. What destination interests you?';
      } else if (lowerMessage.includes('visa')) {
        response = 'We provide professional visa assistance and documentation services for various countries. Which country are you planning to visit?';
      } else if (lowerMessage.includes('consultation') || lowerMessage.includes('book')) {
        response = 'Perfect! We offer free initial consultations. You can reach us at +233 123 456 789 or email info@godfirstedu.com to schedule an appointment. We\'re available Monday to Saturday.';
      } else {
        response = 'Thank you for your message! Our team will get back to you shortly. For immediate assistance, please call us at +233 123 456 789 or visit our Contact page.';
      }

      setMessages(prev => [...prev, {
        text: response,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

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
          Let&apos;s Chat
        </span>

        {/* Notification Badge */}
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: isOpen ? 0 : 1 }}
          transition={{ delay: 0.5 }}
        >
          1
        </motion.div>

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
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Godfirst Support</h3>
                    <p className="text-white/80 text-xs">Online • Responds in minutes</p>
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

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.isUser ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        {msg.isUser ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <div className={`rounded-2xl px-4 py-2 ${
                          msg.isUser
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-card border border-border rounded-tl-none'
                        }`}>
                          <p className={`text-sm ${msg.isUser ? 'text-white' : 'text-foreground'}`}>
                            {msg.text}
                          </p>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Replies */}
              {messages.length <= 2 && (
                <div className="px-4 py-3 border-t border-border bg-background">
                  <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSendMessage(reply)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors"
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
                    className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-gradient-to-r from-primary via-secondary to-accent text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!message.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  We typically reply within minutes
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
