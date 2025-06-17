import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOnClickOutside } from './hooks/useOnClickOutside';
import MessageInputContainer from './components/MessageInputContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, createTheme } from '@mui/material';
import { Menu, Close, Brightness4, Brightness7, ArrowDropDown } from '@mui/icons-material';
import { Sidebar } from './components/Sidebar';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './App.css';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthButton from './components/AuthButton';
import { signInWithGoogle, signOutUser } from './firebase';

const LLM_MODELS = [
  {
    id: 'deepseek',
    name: "DeepSeek",
    modelId: 'deepseek',
    color: '#4D8EFF'
  },
  {
    id: 'deepseek-r1',
    name: "DeepSeek-r1",
    modelId: 'deepseek-r1',
    color: '#FF6B6B'
  },
  {
    id: 'deepseek-v3',
    name: "DeepSeek-v3",
    modelId: 'deepseek-v3',
    color: '#99FF6B'
  },
  {
    id: 'gemini',
    name: "Gemini",
    modelId: 'gemini',
    color: '#D9534F'
  },
  {
    id: "gemma",
    name: "Gemma",
    modelId: "gemma",
    color: '#FF6B6B'
  },
  {
    id: 'qwen',
    name: "Qwen",
    modelId: 'qwen',
    color: '#7F52FF'
  },
  {
    id: "qwen 2.5",
    name: "Qwen 2.5",
    modelId: "qwen 2.5",
    color: '#7DFF6B'
  },
  {
    id: 'llama-4-maverick',
    name: "Llama-4-Maverick",
    modelId: 'llama-4-maverick',
    color: '#99FF6B'
  },
  {
    id: "llama-4-scout",
    name: "Llama-4-Scout",
    modelId: "llama-4-scout",
    color: '#1DFF6B'
  },
  {
    id: "deepseek-r1-free",
    name: "DeepSeek-r1-free",
    modelId: "deepseek-r1-free",
    color: '#99FF6B'
  },
  {
    id: "qwen3 235b",
    name: "Qwen-3 235b",
    modelId: "qwen3 235b",
    color: '#7F52FF'
  },
];

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedModel, setSelectedModel] = useState(LLM_MODELS[0].modelId);
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem('chatSessions');
    return savedChats ? JSON.parse(savedChats) : {};
  });
  const [input, setInput] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme ? parseInt(savedTheme) : 1;
  });
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);
  useOnClickOutside(userMenuRef, () => setIsUserMenuOpen(false));
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [inputPosition, setInputPosition] = useState('center');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogin = async () => { await signInWithGoogle(); };
  const handleLogout = async () => { await signOutUser(); setUser(null); };
  
  // Добавляем функцию смены аккаунта
  const handleSwitchAccount = async () => {
    await signOutUser();
    await signInWithGoogle();
  };

  // Аутентификация
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthLoading(false);
      
      if (user) {
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        }));
      } else {
        localStorage.removeItem('user');
      }
    });

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    return () => unsubscribe();
  }, []);

  // Закрытие сайдбара на мобильных
  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsPanelOpen(false);
    }
  };

  useOnClickOutside(sidebarRef, closeSidebar);
  useOnClickOutside(userMenuRef, () => setIsUserMenuOpen(false));

  // Позиция поля ввода
  useEffect(() => {
    if (!activeSession) {
      setInputPosition('center');
      setShowWelcome(true);
    } else {
      const hasUserMessages = chats[activeSession]?.messages?.some(m => m.isUser);
      setShowWelcome(!hasUserMessages);
      setInputPosition(hasUserMessages ? 'bottom' : 'center');
    }
  }, [activeSession, chats]);

  // Управление темой
  const applyTheme = useCallback(() => {
    if (themeMode === 2) {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
    } else {
      const isDark = themeMode === 1;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }, [themeMode]);

  useEffect(() => {
    applyTheme();
    
    if (themeMode === 2) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        applyTheme();
        setThemeMode(prev => {
          localStorage.setItem('themeMode', prev.toString());
          return prev;
        });
      };
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [themeMode, applyTheme]);

  // Создание новой сессии
  const createNewSession = () => {
    const sessionId = `session-${Date.now()}`;
    const newChats = {
      ...chats,
      [sessionId]: {
        messages: [],
        model: selectedModel
      }
    };
    setChats(newChats);
    localStorage.setItem('chatSessions', JSON.stringify(newChats));
    setActiveSession(sessionId);
    setIsPanelOpen(true);
    setShowWelcome(true);
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if ((!input.trim() && !input.includes('![')) || isLoading) return;

    try {
      if (!activeSession || !chats[activeSession]) {
        createNewSession();
        return;
      }

      const imageMatches = input.match(/!\[.*?\]\((.*?)\)/g) || [];
      const imageUrls = imageMatches.map(match => {
        const urlMatch = match.match(/\((.*?)\)/);
        return urlMatch ? urlMatch[1] : null;
      }).filter(url => url);

      const newMessages = [...chats[activeSession].messages];
      const userMessage = {
        content: input,
        isUser: true,
        imageUrl: imageUrls[0] || null,
        id: Date.now()
      };

      newMessages.push(userMessage);
      
      const tempAiMessage = {
        content: '',
        isUser: false,
        aiImages: [],
        isStreaming: true,
        id: Date.now() + 1
      };

      newMessages.push(tempAiMessage);

      setChats(prev => ({
        ...prev,
        [activeSession]: {
          ...prev[activeSession],
          messages: newMessages
        }
      }));

      setInput('');
      setIsLoading(true);

      const response = await fetch('https://hdghs.onrender.com/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          userInput: input,
          model: selectedModel,
          imageUrl: imageUrls[0] || null,
          userId: user?.uid || "anonymous"
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      // Захватываем текущие значения
      const currentSessionId = activeSession;
      const tempAiMessageId = tempAiMessage.id;

  const processStream = async ({ done, value }) => {
      if (done) {
        setChats(prev => {
          const newChats = {...prev};
          if (newChats[currentSessionId]) {
            const messages = [...newChats[currentSessionId].messages];
            const aiIndex = messages.findIndex(m => m.id === tempAiMessageId);
            
            if (aiIndex !== -1) {
              messages[aiIndex] = {
                ...messages[aiIndex],
                content: accumulatedContent,
                isStreaming: false
              };
            }
            newChats[currentSessionId] = {
              ...newChats[currentSessionId],
              messages
            };
          }
          return newChats;
        });
        return;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') {
            await processStream({ done: true, value: undefined });
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            accumulatedContent += parsed.content;
            
            setChats(prev => {
              const newChats = {...prev};
              if (newChats[currentSessionId]) {
                const messages = [...newChats[currentSessionId].messages];
                const aiIndex = messages.findIndex(m => m.id === tempAiMessageId);
                
                if (aiIndex !== -1) {
                  messages[aiIndex] = {
                    ...messages[aiIndex],
                    content: accumulatedContent
                  };
                  newChats[currentSessionId] = {
                    ...newChats[currentSessionId],
                    messages
                  };
                }
              }
              return newChats;
            });
            
            scrollToBottom();
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }

      return reader.read().then(processStream);
    };

    reader.read().then(processStream);
    scrollToBottom();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
};

  // Прокрутка к последнему сообщению
  const scrollToBottom = useCallback(() => {
  if (messagesEndRef.current) {
    const container = chatContainerRef.current;
    const isNearBottom = 
      container.scrollHeight - container.scrollTop <= container.clientHeight + 200;
    
    if (isNearBottom) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }
}, []);

  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [chats[activeSession]?.messages, scrollToBottom]);

  // Компонент переключения панели
  const PanelToggleButton = ({ isPanelOpen }) => (
    <motion.button
      className="panel-toggle"
      onClick={() => setIsPanelOpen(!isPanelOpen)}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isPanelOpen ? <Close /> : <Menu />}
    </motion.button>
  );

  const ModelIcon = ({ modelId, color }) => {
  const getInitial = () => {
    if (!modelId) return '?';
    const parts = modelId.split('-');
    return parts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 2);
  };

  return (
    <div 
      className="model-icon" 
      style={{ 
        backgroundColor: color || '#999',
        width: '24px',
        height: '24px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px'
      }}
    >
      {getInitial()}
    </div>
  );
};

  // Компонент Message
  const Message = React.memo(({ content, isUser, imageUrl, aiImages, model, isStreaming, userPhotoURL }) => {
  // Fallback объект для модели
  const modelData = model || {
    id: 'unknown',
    name: 'Unknown Model',
    color: '#999',
  };

  return (
    <div className={`message ${isUser ? 'user' : 'ai'}`}>
      <div className="message-header">
        {isUser ? (
          <div className="message-user-info">
            <img 
              src={userPhotoURL || '/default-user.png'} 
              alt="User" 
              className="message-avatar"
              onError={(e) => {
                e.target.src = '/default-user.png';
              }}
            />
            <span>Вы</span>
          </div>
        ) : (
          <div className="model-info">
            <ModelIcon 
              modelId={modelData.id} 
              color={modelData.color} 
            />
            <span>{modelData.name}</span>
          </div>
        )}
      </div>
      
      <div className="message-content">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            img: ({ src, alt }) => (
              <img 
                src={src} 
                alt={alt} 
                className="message-image"
                loading="lazy"
              />
            ),
            table: ({ children }) => (
              <div className="table-container">
                <table>{children}</table>
              </div>
            )
          }}
        >
          {content}
        </ReactMarkdown>
        
        {isStreaming && (
          <div className="streaming-indicator">
            <div className="dot-flashing"></div>
          </div>
        )}
      </div>
    </div>
  );
});

   return (
    <ThemeProvider theme={createTheme({ palette: { mode: themeMode === 1 ? 'dark' : 'light' } })}>
      <div className={`app ${themeMode === 0 ? 'light-theme' : themeMode === 1 ? 'dark-theme' : 'system-theme'}`}>
        {isAuthLoading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
          </div>
        ) : user ? (
          <>
            <div className="top-toolbar">
              
              
              <div className="user-menu-container" ref={userMenuRef}>
                <motion.button
                  className="user-avatar-button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="user-avatar-toolbar"
                  />
                </motion.button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      className="user-menu-dropdown"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="user-details">
                        <div className="user-name">{user.displayName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      <button className="menu-item" onClick={handleSwitchAccount}>
                        Сменить аккаунт
                      </button>
                      <button className="menu-item" onClick={handleLogout}>
                        Выйти
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Sidebar
              ref={sidebarRef}
              isPanelOpen={isPanelOpen}
              setIsPanelOpen={setIsPanelOpen}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              chats={chats}
              setChats={setChats}
              activeSession={activeSession}
              setActiveSession={setActiveSession}
              themeMode={themeMode}
              setThemeMode={(mode) => {
                setThemeMode(mode);
                localStorage.setItem('themeMode', mode.toString());
              }}
            />

            <PanelToggleButton isPanelOpen={isPanelOpen} />

            <main 
              className={`main-content ${isPanelOpen ? 'sidebar-open' : ''} ${isPanelOpen ? '' : 'full-width'}`}
              onClick={() => window.innerWidth <= 768 && closeSidebar()}
            >
              <div className="chat-container" ref={chatContainerRef}>
                <div className="messages-container">
                  <AnimatePresence>
                    {(!activeSession || showWelcome) && (
                      <motion.div
                        className="welcome-message"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h1>Добро пожаловать, {user.displayName}!</h1>
                        <p>Начните новый диалог с моделью</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {activeSession && (chats[activeSession]?.messages || []).map((msg) => {
  // Добавляем проверку на существование модели в сессии
  const sessionModel = chats[activeSession]?.model;
  const modelObj = sessionModel 
            ? LLM_MODELS.find(m => m.modelId === sessionModel) || LLM_MODELS[0]
            : LLM_MODELS[0];
  
  return (
    <Message
      key={msg.id}
      content={msg.content}
      isUser={msg.isUser}
      imageUrl={msg.imageUrl}
      aiImages={msg.aiImages}
      model={modelObj} // передаем всегда валидный объект
      isStreaming={msg.isStreaming}
      userPhotoURL={user?.photoURL}
    />
  );
})}
                  <div ref={messagesEndRef} className="messages-end-anchor" />
                </div>
              </div>
            </main>

            {inputPosition === 'center' ? (
              <div className="welcome-input-container">
                <MessageInputContainer
                  input={input}
                  onInputChange={(e) => setInput(e.target.value)}
                  onSend={() => {
                    sendMessage();
                    setInputPosition('bottom');
                  }}
                  isLoading={isLoading}
                  centered
                  onFileUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setInput(prev => prev + `\n![${file.name}](${event.target.result})`);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            ) : (
              <MessageInputContainer
                input={input}
                onInputChange={(e) => setInput(e.target.value)}
                onSend={sendMessage}
                isLoading={isLoading}
                onFileUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setInput(prev => prev + `\n![${file.name}](${event.target.result})`);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            )}
          </>
        ) : (
          <div className="auth-container">
            <div className="auth-card">
              <h2>Добро пожаловать в DeepSeek Chat</h2>
              <p>Для начала работы войдите с помощью Google</p>
              {/* Исправляем компонент AuthButton */}
              <AuthButton user={user} onLogin={handleLogin} />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
