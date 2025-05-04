import React, { useState, useRef, useEffect } from "react";
import { 
  Users, 
  Send, 
  Smile, 
  MessageSquare, 
  Bell, 
  BellOff, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle,
  Type,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "@/components/LoveParticles";

// Types
type User = {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  isTyping?: boolean;
  lastSeen?: string;
};

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  reactions: {
    [key: string]: string[];
  };
};

// Mock data
const mockUsers: User[] = [
  { id: '1', name: 'Emma Watson', avatar: 'https://i.pravatar.cc/150?img=1', status: 'online' },
  { id: '2', name: 'Chris Evans', avatar: 'https://i.pravatar.cc/150?img=2', status: 'online' },
  { id: '3', name: 'Zoe Saldana', avatar: 'https://i.pravatar.cc/150?img=3', status: 'busy' },
  { id: '4', name: 'Ryan Reynolds', avatar: 'https://i.pravatar.cc/150?img=4', status: 'away' },
  { id: '5', name: 'Jennifer Lawrence', avatar: 'https://i.pravatar.cc/150?img=5', status: 'offline' },
  { id: '6', name: 'Tom Holland', avatar: 'https://i.pravatar.cc/150?img=6', status: 'online' },
];

const initialMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    text: 'Hey there! How are you doing today?',
    timestamp: new Date(Date.now() - 1000 * 60 * 24),
    reactions: {},
  },
  {
    id: '2',
    senderId: '1',
    text: 'I\'m good! Just working on this new project. It\'s pretty exciting!',
    timestamp: new Date(Date.now() - 1000 * 60 * 23),
    reactions: { '👍': ['2'] },
  },
  {
    id: '3',
    senderId: '2',
    text: 'That sounds awesome! Can you tell me more about it?',
    timestamp: new Date(Date.now() - 1000 * 60 * 22),
    reactions: {},
  },
  {
    id: '4',
    senderId: '1',
    text: 'It\'s a messaging app with real-time chat and cool features like reactions and typing indicators!',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    reactions: { '😍': ['2'], '🚀': ['2', '3'] },
  },
];

const statusOptions = [
  { value: 'online', label: 'Online', color: 'bg-green-500' },
  { value: 'busy', label: 'Busy', color: 'bg-red-500' },
  { value: 'away', label: 'Away', color: 'bg-yellow-500' },
  { value: 'offline', label: 'Offline', color: 'bg-gray-500' }
];

const quickMessages = [
  { text: 'brb', description: 'Be right back' },
  { text: 'omw', description: 'On my way' },
  { text: 'lol', description: 'Laughing out loud' },
  { text: 'k', description: 'Okay' },
  { text: 'ttyl', description: 'Talk to you later' },
];

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚀'];

// Particle Component
const LoveParticle = ({ id, color, size, animationDuration }: { id: number, color: string, size: number, animationDuration: number }) => {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const randomDelay = Math.random() * 2;
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: '50%',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1, 1, 0], 
        opacity: [0, 0.8, 0.8, 0],
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * -100],
      }}
      transition={{ 
        duration: animationDuration,
        delay: randomDelay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    />
  );
};

// Heart SVG Component
const Heart = ({ className }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={className || "w-4 h-4 text-red-500"}
      initial={{ scale: 0.8 }}
      animate={{ scale: [0.8, 1, 0.8] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <path
        fill="currentColor"
        d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"
      />
    </motion.svg>
  );
};

// Animated Background Component
const AnimatedBackground = () => {
  const particles = Array(30).fill(0).map((_, index) => {
    const size = Math.random() * 8 + 4;
    return (
      <LoveParticle 
        key={index}
        id={index}
        color={index % 3 === 0 ? '#ff6b6b' : index % 3 === 1 ? '#f06292' : '#ec407a'}
        size={size}
        animationDuration={Math.random() * 3 + 2}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-pink-500/5 z-0"></div>
    </div>
  );
};

const Chat = () => {
  // States
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(mockUsers[1]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [showAnimatedBg, setShowAnimatedBg] = useState<boolean>(false);
  
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Set a random user to be typing periodically
    const interval = setInterval(() => {
      if (!selectedUser) return;
      
      if (Math.random() > 0.7) {
        const updatedUsers = users.map(user => 
          user.id === selectedUser.id ? { ...user, isTyping: true } : user
        );
        setUsers(updatedUsers);
        
        setTimeout(() => {
          const resetUsers = users.map(user => 
            user.id === selectedUser.id ? { ...user, isTyping: false } : user
          );
          setUsers(resetUsers);
          
          // Add a message from the user who was typing
          if (Math.random() > 0.5) {
            const randomResponses = [
              "Yeah, that sounds good to me!",
              "I'm not sure about that. Let me think...",
              "Can we talk about this later?",
              "That's awesome! 😊",
              "I'll get back to you on this tomorrow.",
              "Have you seen the latest movie that came out?",
            ];
            
            addMessage({
              id: Date.now().toString(),
              senderId: selectedUser.id,
              text: randomResponses[Math.floor(Math.random() * randomResponses.length)],
              timestamp: new Date(),
              reactions: {}
            });
          }
        }, 2000 + Math.random() * 2000);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedUser, users]);

  // Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Show typing indicator
    if (selectedUser) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      setIsTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    if (message.senderId !== currentUser.id && notifications) {
      toast(`New message from ${users.find(u => u.id === message.senderId)?.name}`, {
        description: message.text.length > 30 ? message.text.substring(0, 30) + '...' : message.text,
      });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date(),
      reactions: {}
    };
    
    addMessage(message);
    setNewMessage("");
    setIsTyping(false);
    
    // Simulate a response
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const otherUser = users.find(u => u.id === selectedUser.id);
        if (otherUser) {
          const updatedUsers = users.map(user => 
            user.id === selectedUser.id ? { ...user, isTyping: true } : user
          );
          setUsers(updatedUsers);
          
          setTimeout(() => {
            const resetUsers = users.map(user => 
              user.id === selectedUser.id ? { ...user, isTyping: false } : user
            );
            setUsers(resetUsers);
            
            const responseMessages = [
              "That's interesting! Tell me more.",
              "I agree with you!",
              "Hmm, I need to think about that.",
              "Sounds good to me!",
              "Let's talk about something else.",
              "Cool! 😎"
            ];
            
            addMessage({
              id: Date.now().toString(),
              senderId: selectedUser.id,
              text: responseMessages[Math.floor(Math.random() * responseMessages.length)],
              timestamp: new Date(),
              reactions: {}
            });
          }, 1000 + Math.random() * 1000);
        }
      }, 500 + Math.random() * 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
    toast(notifications ? "Notifications turned off" : "Notifications turned on");
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId 
        ? {
            ...message, 
            reactions: {
              ...message.reactions,
              [emoji]: [...(message.reactions[emoji] || []), currentUser.id]
            }
          }
        : message
    ));
  };

  const sendQuickMessage = (text: string) => {
    if (!selectedUser) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text,
      timestamp: new Date(),
      reactions: {}
    };
    
    addMessage(message);
  };

  const updateUserStatus = (status: 'online' | 'busy' | 'away' | 'offline') => {
    setCurrentUser(prev => ({ ...prev, status }));
    toast(`Status updated to ${status}`);
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setShowAnimatedBg(true); // Activate the animated background
    scrollToBottom();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <motion.nav 
        className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-purple-600" />
          <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
            Echo Chat Waves
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <img src={currentUser.avatar} alt={currentUser.name} />
                  </Avatar>
                  <span className="font-medium">{currentUser.name}</span>
                  <span 
                    className={cn(
                      "w-2 h-2 rounded-full",
                      currentUser.status === 'online' ? 'bg-green-500' : 
                      currentUser.status === 'busy' ? 'bg-red-500' : 
                      currentUser.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                    )}
                  ></span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="space-y-1">
                <p className="text-sm font-medium mb-2">Set Status:</p>
                {statusOptions.map(option => (
                  <Button 
                    key={option.value} 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                    onClick={() => updateUserStatus(option.value as any)}
                  >
                    <span className={`w-2 h-2 rounded-full ${option.color}`} />
                    {option.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={notifications ? "text-purple-600" : "text-gray-400"}
            onClick={toggleNotifications}
          >
            {notifications ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </Button>
        </div>
      </motion.nav>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* User Sidebar */}
        <motion.aside
          className="w-[280px] bg-white border-r overflow-y-auto hidden md:block"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-4 w-4" /> Online Users
              </h2>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {users.filter(u => u.status === 'online').length}
              </Badge>
            </div>
            
            <div className="space-y-1">
              {users.filter(u => u.id !== currentUser.id).map((user) => (
                <motion.button
                  key={user.id}
                  className={cn(
                    "w-full p-2 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors",
                    selectedUser?.id === user.id ? "bg-gray-100" : ""
                  )}
                  onClick={() => selectUser(user)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <img src={user.avatar} alt={user.name} />
                    </Avatar>
                    <span 
                      className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                        user.status === 'online' ? 'bg-green-500' : 
                        user.status === 'busy' ? 'bg-red-500' : 
                        user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      )}
                    ></span>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-start">
                    <span className="font-medium text-sm">{user.name}</span>
                    <span className="text-xs text-gray-500">
                      {user.isTyping ? (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Type className="h-3 w-3" /> typing...
                        </span>
                      ) : (
                        user.status === 'online' ? 'Active now' : 
                        `${user.status.charAt(0).toUpperCase() + user.status.slice(1)}`
                      )}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Quick Messages */}
          <div className="p-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Messages</h3>
            <div className="flex flex-wrap gap-1">
              {quickMessages.map((msg) => (
                <motion.button
                  key={msg.text}
                  className="px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  onClick={() => sendQuickMessage(msg.text)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={msg.description}
                >
                  {msg.text}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.aside>
        
        {/* Chat Area */}
        <motion.main 
          className="flex-1 flex flex-col overflow-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Animated Background */}
          <AnimatePresence>
            {showAnimatedBg && <AnimatedBackground />}
          </AnimatePresence>
          
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white relative z-10">
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <img src={selectedUser.avatar} alt={selectedUser.name} />
                    </Avatar>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {selectedUser.name} 
                        {selectedUser.isTyping && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Type className="h-3 w-3" /> typing...
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedUser.status === 'online' ? 'Active now' : 
                         `${selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(null);
                      setShowAnimatedBg(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.filter(m => 
                    (m.senderId === currentUser.id && m.senderId === currentUser.id && selectedUser && m.senderId === selectedUser.id) || 
                    (m.senderId === currentUser.id && selectedUser && selectedUser.id === selectedUser.id) ||
                    (m.senderId === selectedUser.id && selectedUser && m.senderId === selectedUser.id)
                  ).map((message) => {
                    const isMe = message.senderId === currentUser.id;
                    const sender = isMe ? currentUser : users.find(u => u.id === message.senderId);
                    
                    return (
                      <motion.div 
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          isMe ? "justify-end" : "justify-start"
                        )}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {!isMe && (
                          <Avatar className="h-8 w-8">
                            <img src={sender?.avatar} alt={sender?.name} />
                          </Avatar>
                        )}
                        
                        <div className={cn(
                          "max-w-[70%]",
                          isMe ? "order-1" : "order-2"
                        )}>
                          <div className={cn(
                            "p-3 rounded-lg relative",
                            isMe ? 
                              "bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-br-none" : 
                              "bg-white border shadow-sm rounded-bl-none"
                          )}>
                            <p className="text-sm">{message.text}</p>
                          </div>
                          
                          {/* Time */}
                          <p className={cn(
                            "text-xs mt-1",
                            isMe ? "text-right text-gray-500" : "text-gray-500"
                          )}>
                            {formatTime(message.timestamp)}
                          </p>
                          
                          {/* Reactions */}
                          {Object.keys(message.reactions).length > 0 && (
                            <div className={cn(
                              "flex flex-wrap gap-1 mt-1",
                              isMe ? "justify-end" : "justify-start"
                            )}>
                              {Object.entries(message.reactions).map(([emoji, userIds]) => (
                                <Badge 
                                  key={emoji} 
                                  variant="secondary"
                                  className="text-xs bg-white shadow-sm"
                                >
                                  {emoji} {userIds.length}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Reaction Button */}
                          <div className={cn(
                            "mt-1",
                            isMe ? "text-right" : "text-left"
                          )}>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 rounded-full p-0"
                                >
                                  <Smile className="h-4 w-4 text-gray-500" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2">
                                <div className="flex gap-1 flex-wrap">
                                  {reactionEmojis.map(emoji => (
                                    <motion.button
                                      key={emoji}
                                      className="text-lg hover:scale-125 transition-all"
                                      onClick={() => addReaction(message.id, emoji)}
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      {emoji}
                                    </motion.button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        
                        {isMe && (
                          <Avatar className="h-8 w-8">
                            <img src={currentUser.avatar} alt={currentUser.name} />
                          </Avatar>
                        )}
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border-gray-200 focus:ring-purple-500"
                  />
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-500">
                        <Smile className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="w-auto p-2">
                      <div className="grid grid-cols-8 gap-2">
                        {['😊', '😂', '❤️', '👍', '🎉', '🔥', '🤔', '😎', 
                          '😢', '😍', '🙏', '👋', '⭐', '💯', '🤗', '👏'].map(emoji => (
                          <motion.button
                            key={emoji}
                            className="text-xl hover:scale-125 transition-all p-1"
                            onClick={() => setNewMessage(prev => prev + emoji)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    onClick={sendMessage} 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Send className="h-4 w-4 mr-2" /> Send
                  </Button>
                </div>
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div 
                      className="mt-2 text-xs text-purple-600 flex items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      <Type className="h-3 w-3" /> 
                      You are typing...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4">
                <MessageCircle className="h-16 w-16 text-purple-200 mx-auto" />
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-2">Welcome to Echo Chat Waves</h2>
              <p className="text-gray-500 max-w-md mb-6">
                Select a user from the sidebar to start chatting. Send messages, reactions, and see when others are typing.
              </p>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => selectUser(mockUsers[1])}
              >
                Start Chatting
              </Button>
            </div>
          )}
        </motion.main>
        
        {/* Mobile User List */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t p-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {users.filter(u => u.id !== currentUser.id).map(user => (
              <button
                key={user.id}
                className={cn(
                  "flex flex-col items-center p-1 min-w-[3rem]",
                  selectedUser?.id === user.id ? "bg-purple-50 rounded-lg" : ""
                )}
                onClick={() => selectUser(user)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <img src={user.avatar} alt={user.name} />
                  </Avatar>
                  <span 
                    className={cn(
                      "absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white",
                      user.status === 'online' ? 'bg-green-500' : 
                      user.status === 'busy' ? 'bg-red-500' : 
                      user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                    )}
                  ></span>
                </div>
                <span className="text-xs mt-1 truncate w-full text-center">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t px-4 py-3 text-xs text-center text-gray-500">
        <div className="flex items-center justify-center gap-1">
          Made with <Heart /> by Echo Chat Waves
        </div>
        <div className="mt-1">© {new Date().getFullYear()} All rights reserved</div>
      </footer>
    </div>
  );
};

export default Chat;
