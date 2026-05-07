import { useState } from 'react';
import { Sparkles, Send, X } from 'lucide-react';
import { Institution } from '../types';
import { api } from '../services/api';

interface AIAssistantProps {
  onClose?: () => void;
  institutions: Institution[];
}

interface Message {
  type: 'user' | 'assistant';
  text: string;
}

export function AIAssistant({ onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      text: 'Olá! Sou o Assistente Educa. Posso ajudar você a encontrar escolas, atividades e instituições em Cajamar. Como posso ajudar?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'Quais escolas existem no Jordanésia?',
    'Quais atividades gratuitas estão abertas?',
    'Qual escola tem melhor Score Educa Cajamar?',
    'Quais bairros têm menos cobertura educacional?'
  ];

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isTyping) return;

    setMessages((prev) => [...prev, { type: 'user', text: question }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.askAI(question);
      setMessages((prev) => [...prev, { type: 'assistant', text: response.answer }]);
    } catch (error) {
      console.error('Falha ao consultar assistente', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          text: 'Não consegui consultar a IA agora. Tente novamente em instantes.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold text-foreground">Assistente Educa</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Perguntas sugeridas:</p>
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(question)}
                className="block w-full text-left px-3 py-2 bg-accent/50 hover:bg-accent rounded text-sm text-foreground transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo como: escolas perto do Portal..."
            className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
