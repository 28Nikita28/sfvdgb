import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthButton from './components/AuthButton';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useOnClickOutside } from './hooks/useOnClickOutside';
import MessageInputContainer from './components/MessageInputContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, createTheme } from '@mui/material';
import { Menu, Close, Brightness4, Brightness7, ArrowDropDown } from '@mui/icons-material';
import { Sidebar } from './components/Sidebar';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './App.css';

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
    id: '"deepseek-r1-free"',
    name: "DeepSeek-r1-free",
    modelId: '"deepseek-r1-free"',
    color: '#8SFF6B'
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
    return savedTheme ? parseInt(savedTheme) : 1; // 0 - light, 1 - dark, 2 - system
  });
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const sidebarRef = useRef(null);

  // Обработчик закрытия сайдбара
  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsPanelOpen(false);
    }
  };

  // Хук для обработки клика вне сайдбара
  useOnClickOutside(sidebarRef, closeSidebar);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [inputPosition, setInputPosition] = useState('center');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthLoading(false);
      
      // Сохраняем данные пользователя в localStorage
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

    // Проверяем localStorage при загрузке
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    return () => unsubscribe();
  }, []);

  // Управление состоянием приветствия и позицией поля ввода
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

  // Тема и начальные настройки
  const toggleTheme = () => {
    const newThemeMode = (themeMode + 1) % 3;
    setThemeMode(newThemeMode);
    localStorage.setItem('themeMode', newThemeMode.toString());
  };

  useEffect(() => {
    const applyTheme = () => {
      if (themeMode === 2) {
        // Системная тема
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', systemDark);
        document.body.classList.toggle('light-mode', !systemDark);
      } else {
        // Ручной выбор темы
        const isDark = themeMode === 1;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
      }
    };

    applyTheme();
    
    if (themeMode === 2) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        applyTheme();
        // Принудительно обновляем компоненты
        setThemeMode(prev => {
          localStorage.setItem('themeMode', prev.toString());
          return prev;
        });
      };
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [themeMode]);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

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

      // Добавление сообщения пользователя
      const newMessages = [...chats[activeSession].messages];
      const userMessage = {
        content: input,
        isUser: true,
        imageUrl: imageUrls[0] || null,
        id: Date.now() // Уникальный ID для сообщения
      };

      newMessages.push(userMessage);
      
      // Создаем временное сообщение AI с уникальным ID
      const tempAiMessage = {
        content: '',
        isUser: false,
        aiImages: [],
        isStreaming: true,
        id: Date.now() + 1 // Уникальный ID для временного сообщения
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

      // Отправка запроса с поддержкой потока
      const response = await fetch('https://hdghs.onrender.com/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          userInput: input,
          model: selectedModel,
          imageUrl: imageUrls[0] || null
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessageIndex = chats[activeSession].messages.length;
      let accumulatedContent = '';

      const processStream = async ({ done, value }) => {
        if (done) {
          // Обновляем временное сообщение в финальное состояние
          setChats(prev => {
            const newMessages = [...prev[activeSession].messages];
            const aiMessageIndex = newMessages.findIndex(msg => msg.id === tempAiMessage.id);
            
            if (aiMessageIndex !== -1) {
              newMessages[aiMessageIndex] = {
                ...newMessages[aiMessageIndex],
                content: accumulatedContent,
                isStreaming: false
              };
            }

            return {
              ...prev,
              [activeSession]: {
                ...prev[activeSession],
                messages: newMessages
              }
            };
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
                const newMessages = [...prev[activeSession].messages];
                const aiMessageIndex = newMessages.findIndex(msg => msg.id === tempAiMessage.id);
                
                if (aiMessageIndex !== -1) {
                  newMessages[aiMessageIndex] = {
                    ...newMessages[aiMessageIndex],
                    content: accumulatedContent
                  };
                }

                return {
                  ...prev,
                  [activeSession]: {
                    ...prev[activeSession],
                    messages: newMessages
                  }
                };
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
    } catch ( error) {
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
        container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
          inline: 'start'
        });
      }
    }
  }, []);

  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [chats[activeSession]?.messages, scrollToBottom]);

  // Компоненты интерфейса
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

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);


  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

  // Компонент выбора модели
  const ModelSelector = () => {
    const currentModel = LLM_MODELS.find(m => m.modelId === selectedModel);

    return (
      <div className="model-selector">
        <motion.button
          className="model-button"
          onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="model-color" style={{ backgroundColor: currentModel?.color }} />
          <span>{currentModel?.name}</span>
          <ArrowDropDown className={`arrow ${isModelMenuOpen ? 'open' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isModelMenuOpen && (
            <motion.div
              className="model-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {LLM_MODELS.map(model => (
                <motion.div
                  key={model.id}
                  className="model-option"
                  onClick={() => {
                    setSelectedModel(model.modelId);
                    setIsModelMenuOpen(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="model-color" style={{ backgroundColor: model.color }} />
                  <div className="model-info">
                    <span className="model-name">{model.name}</span>
                    <span className="model-desc">{model.description}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <ThemeProvider theme={createTheme({ palette: { mode: themeMode === 1 ? 'dark' : 'light' } })}>
      <div className={`app ${
        themeMode === 0 ? 'light-theme' : 
        themeMode === 1 ? 'dark-theme' : 
        'system-theme'
      }`}>
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

        {/* Кнопка переключения панели */}
        <PanelToggleButton isPanelOpen={isPanelOpen} />

        {/* Основное содержимое */}
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
                    <h1>Добро пожаловать!</h1>
                    <p>Начните новый диалог с моделью</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeSession && (chats[activeSession]?.messages || []).map((msg, index) => {
                return (
                <Message
                  key={msg.id || `${activeSession}-${index}`}
                  content={msg.content}
                  isUser={msg.isUser}
                  imageUrl={msg.imageUrl}
                  aiImages={msg.aiImages}
                  model={chats[activeSession]?.model}
                  isStreaming={msg.isStreaming}
                />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>

        {/* Поле ввода */}
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
      </div>
    </ThemeProvider>
  );
}

// Компонент Message
const Message = ({ content, isUser, imageUrl, aiImages, model, isStreaming }) => (
  <motion.div
    className={`message ${isUser ? 'user' : 'ai'} ${isStreaming ? 'streaming' : ''}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {isStreaming && (
      <div className="streaming-indicator">
        <div className="typing-animation">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    )}
    <div className="message-header">
      {isUser ? 'Вы' : LLM_MODELS.find(m => m.modelId === model)?.name || 'AI'}
    </div>
    <div className="message-bubble">
      {imageUrl && <img src={imageUrl} alt="Uploaded content" className="message-image" />}
      {aiImages?.map((img, i) => (
        <img key={i} src={img} alt={`Generated content ${i}`} className="message-image" />
      ))}
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className, children, node, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const [copied, setCopied] = useState(false);

            const copyToClipboard = () => {
              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            };

            const handleCodeFullscreen = (code) => {
              const newWindow = window.open('', '_blank');
              newWindow.document.write(`
                <html>
                  <head>
                    <style>
                      body { margin: 0; padding: 2rem; background: ${themeMode === 1 ? '#1e1e1e' : '#fff'}; }
                      pre { font-size: 1.2em; }
                    </style>
                  </head>
                  <body>
                    <pre>${code}</pre>
                  </body>
                </html>
              `);
            };

            return !inline && match ? (
              <div className="code-block-wrapper">
                <div className="code-header">
                  <span>{match[1]}</span>
                  <div>
                    <button onClick={() => handleCodeFullscreen(children)} className="fullscreen-button">
                      ↗
                    </button>
                    <button onClick={copyToClipboard} className="copy-button">
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  </motion.div>
);

export default App;
