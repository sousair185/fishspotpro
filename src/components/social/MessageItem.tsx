
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Message } from '@/types/social';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  isInbox: boolean;
  onMarkAsRead?: (messageId: string) => void;
  onReply?: (userId: string, userName: string | null, userPhotoURL: string | null) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isInbox, 
  onMarkAsRead,
  onReply
}) => {
  const {
    id,
    senderId,
    senderName,
    senderPhotoURL,
    recipientId,
    recipientName,
    content,
    createdAt,
    read
  } = message;
  
  const handleClick = () => {
    if (isInbox && !read && onMarkAsRead) {
      onMarkAsRead(id);
    }
  };
  
  const handleReply = () => {
    if (isInbox && onReply) {
      onReply(senderId, senderName, senderPhotoURL);
    }
  };
  
  const displayName = isInbox ? senderName : recipientName;
  const photoURL = isInbox ? senderPhotoURL : message.recipientPhotoURL;
  
  return (
    <Card 
      className={cn(
        "hover:bg-accent/50 transition-colors cursor-pointer",
        !read && isInbox && "border-primary bg-primary/5"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={photoURL || undefined} />
            <AvatarFallback>{displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <p className="font-medium">{displayName || 'Usuário'}</p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
            </div>
            
            <p className="text-sm text-foreground/90">{content}</p>
            
            {isInbox && (
              <div className="pt-2 flex justify-end">
                <button 
                  className="text-xs text-primary hover:underline"
                  onClick={handleReply}
                >
                  Responder
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageItem;
