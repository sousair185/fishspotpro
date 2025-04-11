
import { useState } from 'react';
import { useMessages } from './useMessages';

export const useMessageTab = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [recipient, setRecipient] = useState<{
    id: string;
    name: string | null;
    photoURL: string | null;
  } | null>(null);
  
  const { 
    inboxMessages, 
    outboxMessages, 
    loading, 
    fetchInboxMessages, 
    fetchOutboxMessages, 
    markMessageAsRead,
    sendMessage
  } = useMessages();
  
  // Filter messages based on search term
  const filteredInbox = inboxMessages.filter(
    msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (msg.senderName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const filteredOutbox = outboxMessages.filter(
    msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (msg.recipientName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  // Handle opening the compose dialog
  const handleOpenCompose = (userId: string, userName: string | null, userPhotoURL: string | null) => {
    setRecipient({
      id: userId,
      name: userName,
      photoURL: userPhotoURL
    });
    setIsComposeOpen(true);
  };
  
  // Handle sending a message
  const handleSendMessage = async (messageContent: string) => {
    if (!recipient || !messageContent.trim()) return false;
    
    return await sendMessage(
      recipient.id,
      recipient.name,
      recipient.photoURL,
      messageContent
    );
  };
  
  return {
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
  };
};
