"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, MessageCircle, X, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: 'USER' | 'ADMIN' | 'SYSTEM';
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages: Message[];
}

export default function LiveChatWidget() {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(true);
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && user && isOpen) {
      fetchActiveConversation();
    }
  }, [isLoaded, user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversation) {
      const interval = setInterval(() => {
        fetchMessages(conversation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchActiveConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const activeConv = data.find((c: Conversation) => c.status !== 'CLOSED') || data[0];
        setConversation(activeConv);
        setShowNewChat(false);
        fetchMessages(activeConv.id);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    setSending(true);
    try {
      const response = await fetch(`/api/chat/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(conversation.id);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const createConversation = async () => {
    if (!subject.trim() || !initialMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          message: initialMessage,
        }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversation(newConversation);
        setShowNewChat(false);
        setSubject("");
        setInitialMessage("");
        fetchMessages(newConversation.id);
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showNewChat) {
        createConversation();
      } else {
        sendMessage();
      }
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-medium pr-2">Chat with us</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-2xl transition-all ${
          isMinimized ? 'w-80' : 'w-96'
        } ${isMinimized ? 'h-14' : 'h-[600px]'} flex flex-col`}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Live Support</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-blue-700 p-1 rounded transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="hover:bg-blue-700 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Content */}
              {!user ? (
                <div className="flex-1 flex items-center justify-center p-6 text-center">
                  <div>
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Sign in to chat</h4>
                    <p className="text-sm text-gray-600 mb-4">Please sign in to start a conversation with our support team</p>
                    <a
                      href="/sign-in"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Sign In
                    </a>
                  </div>
                </div>
              ) : showNewChat ? (
                <div className="flex-1 flex flex-col p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Start a new conversation</h4>
                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Topic
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select a topic</option>
                        <option value="Order Inquiry">Order Inquiry</option>
                        <option value="Shipping Question">Shipping Question</option>
                        <option value="Return/Refund">Return/Refund</option>
                        <option value="Product Question">Product Question</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="General Question">General Question</option>
                      </select>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        value={initialMessage}
                        onChange={(e) => setInitialMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="How can we help you?"
                        rows={6}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={createConversation}
                    disabled={sending || !subject || !initialMessage.trim()}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    {sending ? 'Starting...' : 'Start Chat'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                            message.senderType === 'USER'
                              ? 'bg-blue-600 text-white'
                              : message.senderType === 'ADMIN'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          }`}
                        >
                          <p>{message.content}</p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className={`text-xs ${
                              message.senderType === 'USER' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.senderType === 'ADMIN' ? 'Support' :
                               message.senderType === 'SYSTEM' ? 'System' : 'You'}
                            </span>
                            <span className={`text-xs ${
                              message.senderType === 'USER' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
