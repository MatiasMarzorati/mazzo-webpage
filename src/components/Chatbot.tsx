'use client';
import React, {
  useState,
  ChangeEvent,
  useRef,
  useEffect,
  KeyboardEvent
} from 'react';
import { Button } from '@nextui-org/react';
import { FaTimes } from 'react-icons/fa';
import { GoNorthStar } from 'react-icons/go';
import { Link as ScrollLink } from 'react-scroll';
import TypingIndicator from './TypingIndicator'; // Importa el componente de animación

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  button?: {
    text: string;
    url: string;
  };
  isDefault?: boolean; // Nueva propiedad opcional
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false); // Nuevo estado para la animación
  const [isFirstOpen, setIsFirstOpen] = useState<boolean>(true); // Estado para controlar el primer despliegue
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Reference for auto-scrolling

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default action of the Enter key (e.g., form submission)
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = async () => {
    if (userInput.trim() === '') return;

    const timestamp = formatTime(new Date());
    const newMessages: Message[] = [
      ...messages,
      { text: userInput, sender: 'user', timestamp }
    ];
    setMessages(newMessages);
    setUserInput('');

    // TYPING INDICATOR (HUMANIZE)
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      // SIMULATE DELAY (HUMANIZE)
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            text: data.response,
            sender: 'bot',
            timestamp: formatTime(new Date()),
            button: data.contactButton
          }
        ]);
        setIsTyping(false);
      }, Math.floor(Math.random() * 2000) + 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }

    // Update state to remove default messages after first user interaction
    if (isFirstOpen) {
      setIsFirstOpen(false);
    }
  };

  const handleDefaultMessageClick = (text: string) => {
    setUserInput(text);
  };

  const handleMessageClick = (message: Message) => {
    if (message.isDefault) {
      handleDefaultMessageClick(message.text);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // AUTO SCROLL
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && isFirstOpen) {
      // Agrega mensajes predeterminados con la nueva propiedad
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "What's the most popular service?",
          sender: 'bot',
          timestamp: '',
          isDefault: true // Marca este mensaje como predeterminado
        },
        {
          text: 'How can I contact support?',
          sender: 'bot',
          timestamp: '',
          isDefault: true // Marca este mensaje como predeterminado
        }
      ]);
    }
  }, [isOpen, isFirstOpen]);

  return (
    <div className="relative">
      {!isOpen && (
        <div
          className="cursor-pointer fixed bottom-4 right-4 bg-emerald-700 text-emerald-100 border border-emerald-500 p-4 rounded-full"
          onClick={toggleChatbot}
        >
          <GoNorthStar />
        </div>
      )}
      {isOpen && (
        <div className="fixed bottom-5 right-4 w-80 bg-slate-900 border border-gray-800 rounded-2xl shadow-lg text-gray-100 flex flex-col h-96">
          <div className="p-2 border-b border-gray-700 text-center text-md font-semibold flex items-center justify-between">
            <h2 className="flex-1 text-center">Ask the AI</h2>
            <button
              className="text-gray-300 hover:text-white"
              onClick={toggleChatbot}
            >
              <FaTimes />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start p-3 mb-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-800 text-gray-100'
                } ${message.isDefault ? 'cursor-pointer' : ''}`} // Cambiado aquí
                onClick={() => handleMessageClick(message)} // Cambiado aquí
              >
                <div className="flex-1">
                  <div className="text-sm">{message.text}</div>
                  {message.button && (
                    <div className="mt-2">
                      <Button
                        as={ScrollLink}
                        to={message.button.url}
                        onClick={() => setIsOpen(false)}
                        smooth={true}
                        duration={500}
                        offset={-64}
                        className="bg-emerald-700 text-emerald-100 border border-emerald-500 mb-3"
                      >
                        {message.button.text}
                      </Button>
                    </div>
                  )}
                  <div className="text-xs text-gray-300">
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-700 flex items-center justify-between">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="p-2.5 mr-2.5 w-full bg-gray-700 text-gray-100 rounded-xl border border-gray-600 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none transition duration-300"
              ref={inputRef}
            />
            <Button
              className="bg-emerald-700 text-emerald-100 border border-emerald-500"
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
