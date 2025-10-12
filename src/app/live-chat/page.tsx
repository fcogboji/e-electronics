"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, MessageCircle, Package, Phone, Mail, Clock, Plus, X } from "lucide-react";

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
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  orderId?: string;
  createdAt: string;
  messages: Message[];
}

interface Order {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'low':
      return 'bg-gray-100 text-gray-800';
    case 'normal':
      return 'bg-blue-100 text-blue-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'resolved':
      return 'bg-purple-100 text-purple-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function LiveChat() {
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState("");
  const [newChatMessage, setNewChatMessage] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchConversations();
      fetchOrders();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      const interval = setInterval(() => {
        fetchMessages(activeConversation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      const data = await response.json();
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${user?.id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
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
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      const response = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
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
        fetchMessages(activeConversation.id);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const createConversation = async () => {
    if (!newChatSubject.trim() || !newChatMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: newChatSubject,
          message: newChatMessage,
          orderId: selectedOrderId || undefined,
        }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation);
        setShowNewChat(false);
        setNewChatSubject("");
        setNewChatMessage("");
        setSelectedOrderId("");
        fetchMessages(newConversation.id);
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Live Chat Support</h1>
          <p className="text-gray-600 mb-6">Get instant help with your orders and questions</p>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Alternative Support Options</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Email Support</h3>
                <p className="text-sm text-gray-600">support@example.com</p>
                <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Phone className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Phone Support</h3>
                <p className="text-sm text-gray-600">+44 20 7946 0958</p>
                <p className="text-xs text-gray-500 mt-1">Mon-Fri 9AM-6PM</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Live Chat</h3>
                <p className="text-sm text-gray-600">Sign in required</p>
                <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">Please sign in to access live chat support</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Chat Support</h1>
        <p className="text-gray-600">Get instant help with your orders and questions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[700px]">
        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <button
                onClick={() => setShowNewChat(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No conversations yet</h3>
                <p className="text-sm text-gray-600">Start a new chat to get help</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversation?.id === conv.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm truncate">{conv.subject}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(conv.status)}`}>
                        {conv.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(conv.priority)}`}>
                        {conv.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {conv.orderId && (
                      <div className="mt-2 flex items-center gap-1">
                        <Package className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">Order #{conv.orderId.slice(-8)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{activeConversation.subject}</h2>
                    <p className="text-sm text-gray-600">
                      Started {new Date(activeConversation.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(activeConversation.priority)}`}>
                      {activeConversation.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeConversation.status)}`}>
                      {activeConversation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderType === 'USER'
                          ? 'bg-blue-600 text-white'
                          : message.senderType === 'ADMIN'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className={`text-xs ${
                          message.senderType === 'USER' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.senderType === 'ADMIN' ? 'Support Agent' :
                           message.senderType === 'SYSTEM' ? 'System' : 'You'}
                        </span>
                        <span className={`text-xs ${
                          message.senderType === 'USER' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
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
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    rows={2}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation to view messages or start a new chat</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Start New Conversation</h2>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  value={newChatSubject}
                  onChange={(e) => setNewChatSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select a topic</option>
                  <option value="Order Inquiry">Order Inquiry</option>
                  <option value="Shipping Question">Shipping Question</option>
                  <option value="Return/Refund">Return/Refund</option>
                  <option value="Product Question">Product Question</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="General Question">General Question</option>
                </select>
              </div>

              {newChatSubject === "Order Inquiry" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Order (Optional)
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select an order</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        Order #{order.id.slice(-8)} - £{order.amount.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Describe your question or issue..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewChat(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createConversation}
                  disabled={loading || !newChatSubject || !newChatMessage.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Creating...' : 'Start Chat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  