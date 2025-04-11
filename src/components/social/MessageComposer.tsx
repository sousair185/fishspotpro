
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';

interface RecipientInfo {
  id: string;
  name: string | null;
  photoURL: string | null;
}

interface MessageComposerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  recipient: RecipientInfo | null;
  onSendMessage: (content: string) => Promise<boolean>;
  loading: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  isOpen,
  setIsOpen,
  recipient,
  onSendMessage,
  loading
}) => {
  const [messageContent, setMessageContent] = useState('');

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    
    const success = await onSendMessage(messageContent);
    
    if (success) {
      setMessageContent('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Mensagem</DialogTitle>
        </DialogHeader>
        
        {recipient && (
          <div className="flex items-center space-x-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={recipient.photoURL || undefined} />
              <AvatarFallback>{recipient.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <span>{recipient.name || 'Usuário'}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <Textarea
            placeholder="Escreva sua mensagem..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={!recipient || !messageContent.trim() || loading}
          >
            <Send className="h-4 w-4 mr-2" /> Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageComposer;
