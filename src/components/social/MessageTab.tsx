
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import { useMessageTab } from '@/hooks/useMessageTab';

const MessageTab: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    isComposeOpen,
    setIsComposeOpen,
    recipient,
    loading,
    filteredInbox,
    filteredOutbox,
    handleOpenCompose,
    handleSendMessage,
    fetchInboxMessages,
    fetchOutboxMessages,
    markMessageAsRead
  } = useMessageTab();
  
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
          <MessageList
            messages={filteredInbox}
            isInbox={true}
            loading={loading}
            onMarkAsRead={markMessageAsRead}
            onRefresh={fetchInboxMessages}
            onReply={handleOpenCompose}
          />
        </TabsContent>
        
        <TabsContent value="outbox">
          <MessageList
            messages={filteredOutbox}
            isInbox={false}
            loading={loading}
            onRefresh={fetchOutboxMessages}
          />
        </TabsContent>
      </Tabs>
      
      <MessageComposer
        isOpen={isComposeOpen}
        setIsOpen={setIsComposeOpen}
        recipient={recipient}
        onSendMessage={handleSendMessage}
        loading={loading}
      />
    </div>
  );
};

export default MessageTab;
