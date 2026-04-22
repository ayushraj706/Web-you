'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Mic,
  Phone,
  Video,
  Info,
  Star,
  Archive,
  Instagram,
  MessageSquare,
  Check,
  CheckCheck,
  Image,
  File,
  X,
  Sparkles
} from 'lucide-react';

// Mock chat data
const mockChats = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'That sounds great! When can we schedule a call?',
    time: '2m ago',
    unread: 3,
    online: true,
    source: 'instagram',
    typing: false
  },
  {
    id: 2,
    name: 'Mike Anderson',
    avatar: 'https://i.pravatar.cc/150?img=12',
    lastMessage: 'I sent you the design files',
    time: '15m ago',
    unread: 0,
    online: true,
    source: 'whatsapp',
    typing: false
  },
  {
    id: 3,
    name: 'Emma Davis',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Perfect! Thanks for the update 👍',
    time: '1h ago',
    unread: 0,
    online: false,
    source: 'instagram',
    typing: false
  },
  {
    id: 4,
    name: 'John Smith',
    avatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'Can you send me the pricing details?',
    time: '2h ago',
    unread: 1,
    online: false,
    source: 'whatsapp',
    typing: false
  },
  {
    id: 5,
    name: 'Lisa Chen',
    avatar: 'https://i.pravatar.cc/150?img=9',
    lastMessage: 'Looking forward to our collaboration!',
    time: '3h ago',
    unread: 0,
    online: true,
    source: 'instagram',
    typing: false
  },
];

const mockMessages = {
  1: [
    { id: 1, sender: 'them', text: 'Hey! I saw your post about the new product launch', time: '10:30 AM', read: true },
    { id: 2, sender: 'me', text: 'Hi Sarah! Yes, we are super excited about it!', time: '10:32 AM', read: true },
    { id: 3, sender: 'them', text: 'The design looks amazing! Can you tell me more about the features?', time: '10:33 AM', read: true },
    { id: 4, sender: 'me', text: 'Of course! Let me send you the full spec sheet', time: '10:35 AM', read: true },
    { id: 5, sender: 'me', text: 'Here are the key highlights:\n- Advanced AI integration\n- Real-time analytics\n- Multi-platform support', time: '10:36 AM', read: true },
    { id: 6, sender: 'them', text: 'That sounds great! When can we schedule a call?', time: '10:38 AM', read: false },
  ],
};

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [chats, setChats] = useState(mockChats);
  const [messages, setMessages] = useState(mockMessages[1] || []);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate typing indicator
    if (selectedChat.typing) {
      const timer = setTimeout(() => {
        const updatedChats = chats.map(chat =>
          chat.id === selectedChat.id ? { ...chat, typing: false } : chat
        );
        setChats(updatedChats);
        setSelectedChat({ ...selectedChat, typing: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedChat.typing]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setMessages(mockMessages[chat.id] || []);
    // Mark as read
    const updatedChats = chats.map(c =>
      c.id === chat.id ? { ...c, unread: 0 } : c
    );
    setChats(updatedChats);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    // Update last message in chat list
    const updatedChats = chats.map(chat =>
      chat.id === selectedChat.id
        ? { ...chat, lastMessage: messageInput, time: 'Just now' }
        : chat
    );
    setChats(updatedChats);

    // Simulate typing indicator for response
    setTimeout(() => {
      const updatedSelectedChat = { ...selectedChat, typing: true };
      setSelectedChat(updatedSelectedChat);
      const typingChats = chats.map(chat =>
        chat.id === selectedChat.id ? { ...chat, typing: true } : chat
      );
      setChats(typingChats);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const MessageBubble = ({ message }) => {
    const isMe = message.sender === 'me';
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}>
        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isMe
                ? 'bg-primary-500 text-white rounded-br-sm'
                : 'bg-white border border-dark-200 text-dark-900 rounded-bl-sm'
            } shadow-sm`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
            <div className={`flex items-center justify-end space-x-1 mt-1 ${isMe ? 'text-white/70' : 'text-dark-500'}`}>
              <span className="text-xs">{message.time}</span>
              {isMe && (
                <span>
                  {message.read ? (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-xl border border-dark-200 overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-96 border-r border-dark-200 flex flex-col bg-white">
        {/* Search Header */}
        <div className="p-4 border-b border-dark-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-50 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              className={`w-full p-4 flex items-start space-x-3 hover:bg-dark-50 transition-colors border-b border-dark-100 ${
                selectedChat?.id === chat.id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  {chat.source === 'instagram' ? (
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                      <Instagram className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-dark-900 text-sm truncate">{chat.name}</h3>
                  <span className="text-xs text-dark-500 ml-2 flex-shrink-0">{chat.time}</span>
                </div>
                <p className={`text-sm truncate ${chat.unread > 0 ? 'font-medium text-dark-900' : 'text-dark-600'}`}>
                  {chat.typing ? (
                    <span className="text-primary-600 flex items-center">
                      <span className="animate-pulse">Typing</span>
                      <span className="ml-1 flex space-x-0.5">
                        <span className="w-1 h-1 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1 h-1 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1 h-1 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </span>
                    </span>
                  ) : (
                    chat.lastMessage
                  )}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="flex-shrink-0 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{chat.unread}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-dark-50">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-dark-200 flex items-center justify-between px-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedChat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900">{selectedChat.name}</h3>
                  <div className="flex items-center space-x-2">
                    {selectedChat.typing ? (
                      <span className="text-xs text-primary-600 font-medium">Typing...</span>
                    ) : (
                      <span className="text-xs text-dark-500">
                        {selectedChat.online ? 'Online' : 'Last seen recently'}
                      </span>
                    )}
                    {selectedChat.source === 'instagram' ? (
                      <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-dark-100 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-dark-600" />
                </button>
                <button className="p-2 hover:bg-dark-100 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-dark-600" />
                </button>
                <button className="p-2 hover:bg-dark-100 rounded-lg transition-colors">
                  <Info className="w-5 h-5 text-dark-600" />
                </button>
                <button className="p-2 hover:bg-dark-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-dark-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {selectedChat.typing && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-dark-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-dark-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5 text-dark-600" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
                    title="Attach image"
                  >
                    <Image className="w-5 h-5 text-dark-600" />
                  </button>
                </div>

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32 text-dark-900"
                    style={{ minHeight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 bottom-3 hover:scale-110 transition-transform"
                  >
                    <Smile className="w-5 h-5 text-dark-500" />
                  </button>
                </div>

                <button
                  type="button"
                  className="p-2 hover:bg-primary-100 rounded-lg transition-colors group"
                  title="Send template message"
                >
                  <Sparkles className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
                </button>

                {messageInput.trim() ? (
                  <button
                    type="submit"
                    className="p-3 bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="p-3 bg-dark-100 hover:bg-dark-200 rounded-xl transition-colors"
                  >
                    <Mic className="w-5 h-5 text-dark-600" />
                  </button>
                )}
              </form>

              {/* Quick Template Messages */}
              <div className="flex items-center space-x-2 mt-3 overflow-x-auto pb-1">
                <span className="text-xs text-dark-500 whitespace-nowrap">Quick replies:</span>
                {['Thanks!', 'Sure, let me check', "I'll get back to you"].map((template) => (
                  <button
                    key={template}
                    onClick={() => setMessageInput(template)}
                    className="px-3 py-1.5 bg-dark-100 hover:bg-dark-200 rounded-full text-xs text-dark-700 whitespace-nowrap transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-dark-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-900 mb-2">Select a conversation</h3>
              <p className="text-dark-600">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
