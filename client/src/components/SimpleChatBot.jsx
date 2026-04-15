import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function SimpleChatBot() {
  const { t, i18n } = useTranslation(); // i18n.language вернет текущий язык (ru, en, etc.)
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  // Начальное сообщение теперь тоже переводится
  const [chat, setChat] = useState([]);

  // Сбрасываем чат или добавляем приветствие при смене языка
  useEffect(() => {
    setChat([{ sender: 'bot', text: t('bot.welcome') }]);
  }, [i18n.language, t]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMsg = message.toLowerCase();
    const newChat = [...chat, { sender: 'user', text: message }];
    setChat(newChat);
    setMessage('');

    setTimeout(() => {
      let botReply = t('bot.default');

      // Логика поиска ключей (работает на любом языке)
      // Если в сообщении есть "xp" или "очки"
      if (userMsg.includes('xp') || userMsg.includes('очк') || userMsg.includes('point')) {
        botReply = t('bot.answers.xp');
      } else if (userMsg.includes('привет') || userMsg.includes('hello') || userMsg.includes('hey')) {
        botReply = t('bot.answers.hello');
      } else if (userMsg.includes('шоп') || userMsg.includes('shop') || userMsg.includes('магаз')) {
        botReply = t('bot.answers.shop');
      }

      setChat([...newChat, { sender: 'bot', text: botReply }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-brand-500 hover:bg-brand-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="bg-brand-500 p-4 text-white font-bold flex justify-between">
            <span>{t('bot.title')}</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3 flex flex-col bg-slate-50 dark:bg-slate-900/50">
            {chat.map((m, i) => (
              <div key={i} className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                m.sender === 'user' 
                  ? 'bg-brand-500 text-white self-end rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 self-start rounded-tl-none shadow-sm'
              }`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 border-t dark:border-slate-700 flex gap-2">
            <input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('bot.placeholder')}
              className="flex-1 bg-slate-100 dark:bg-slate-700 border-none rounded-xl px-4 py-2 text-sm dark:text-white"
            />
            <button onClick={handleSend} className="bg-brand-500 text-white p-2 rounded-xl">➤</button>
          </div>
        </div>
      )}
    </div>
  );
}