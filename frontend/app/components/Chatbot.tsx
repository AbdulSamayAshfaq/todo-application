'use client';

import { ChatKitPanel } from './ChatKitPanel';

interface ChatbotProps {
  onClose: () => void
}

export const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  return (
    <div className="h-full w-full">
      <ChatKitPanel onClose={onClose} />
    </div>
  );
}