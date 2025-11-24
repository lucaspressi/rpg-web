import { useGame } from '@/contexts/GameContext';
import { useEffect, useRef } from 'react';

export default function MessageLog() {
  const { state } = useGame();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'combat':
        return 'text-destructive';
      case 'loot':
        return 'text-yellow-400 font-bold bg-yellow-900/20 px-2 py-0.5 rounded border-l-2 border-yellow-500';
      case 'system':
        return 'text-primary font-bold';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="game-panel p-3 h-48 overflow-y-auto">
      <h3 className="pixel-font text-xs text-primary mb-2">Game Log</h3>
      <div className="space-y-1">
        {state.messages.map((message) => (
          <div
            key={message.id}
            className={`text-xs retro-font ${getMessageStyle(message.type)}`}
          >
            {message.type === 'loot' && '💰 '}
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
