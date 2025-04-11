
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw } from 'lucide-react';
import MessageItem from './MessageItem';
import { Message } from '@/types/social';

interface MessageListProps {
  messages: Message[];
  isInbox: boolean;
  loading: boolean;
  onMarkAsRead?: (messageId: string) => void;
  onRefresh: () => void;
  onReply?: (userId: string, userName: string | null, userPhotoURL: string | null) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isInbox,
  loading,
  onMarkAsRead,
  onRefresh,
  onReply
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-muted-foreground">
          {messages.length} mensagens
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh} 
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
      </div>
      
      <Separator className="mb-4" />
      
      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando mensagens...</p>
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map(message => (
            <MessageItem
              key={message.id}
              message={message}
              isInbox={isInbox}
              onMarkAsRead={isInbox ? onMarkAsRead : undefined}
              onReply={isInbox ? onReply : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {isInbox ? "Nenhuma mensagem recebida." : "Nenhuma mensagem enviada."}
          </p>
        </div>
      )}
    </>
  );
};

export default MessageList;
