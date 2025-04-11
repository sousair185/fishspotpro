
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Send } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import MessageItem from './MessageItem';
import { UserProfile } from '@/types/social';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const MessageTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [recipient, setRecipient] = useState<{
    id: string;
    name: string | null;
    photoURL: string | null;
  } | null>(null);
  const [messageContent, setMessageContent] = useState('');
  
  const { 
    inboxMessages, 
    outboxMessages, 
    loading, 
    fetchInboxMessages, 
    fetchOutboxMessages, 
    markMessageAsRead,
    sendMessage
  } = useMessages();
  
  const filteredInbox = inboxMessages.filter(
    msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (msg.senderName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const filteredOutbox = outboxMessages.filter(
    msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (msg.recipientName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const handleOpenCompose = (userId: string, userName: string | null, userPhotoURL: string | null) => {
    setRecipient({
      id: userId,
      name: userName,
      photoURL: userPhotoURL
    });
    setIsComposeOpen(true);
  };
  
  const handleSendMessage = async () => {
    if (!recipient || !messageContent.trim()) return;
    
    const success = await sendMessage(
      recipient.id,
      recipient.name,
      recipient.photoURL,
      messageContent
    );
    
    if (success) {
      setMessageContent('');
      setIsComposeOpen(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mensagens</h2>
        <Button variant="outline" size="sm" onClick={() => setIsComposeOpen(true)}>
          Nova Mensagem
        </Button>
      </div>
      
      <div className="flex mb-4">
        <Input
          placeholder="Pesquisar mensagens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inbox">Recebidas</TabsTrigger>
          <TabsTrigger value="outbox">Enviadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inbox">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">
              {filteredInbox.length} mensagens
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchInboxMessages} 
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
          ) : filteredInbox.length > 0 ? (
            <div className="space-y-3">
              {filteredInbox.map(message => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isInbox={true}
                  onMarkAsRead={markMessageAsRead}
                  onReply={(userId, userName, userPhotoURL) => handleOpenCompose(userId, userName, userPhotoURL)}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Nenhuma mensagem recebida.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="outbox">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">
              {filteredOutbox.length} mensagens
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchOutboxMessages} 
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
          ) : filteredOutbox.length > 0 ? (
            <div className="space-y-3">
              {filteredOutbox.map(message => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isInbox={false}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Nenhuma mensagem enviada.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de Composição de Mensagem */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
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
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={!recipient || !messageContent.trim() || loading}
            >
              <Send className="h-4 w-4 mr-2" /> Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageTab;
