
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import MessageTab from '@/components/social/MessageTab';
import UserSearchTab from '@/components/social/UserSearchTab';
import { useAuth } from '@/hooks/useAuth';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const { user, isLoading: authLoading } = useAuth();
  const [composeToUser, setComposeToUser] = useState<{
    id: string;
    name: string | null;
    photoURL: string | null;
  } | null>(null);
  
  const handleSelectUser = (userId: string, userName: string | null, userPhotoURL: string | null) => {
    setComposeToUser({
      id: userId,
      name: userName,
      photoURL: userPhotoURL
    });
    setActiveTab('messages');
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Mensagens</h1>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Entre para ver mensagens</h2>
              <p className="mb-6">Faça login para acessar o sistema de mensagens.</p>
            </div>
          </div>
        </div>
        <Navbar />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Mensagens</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="search">Buscar Usuários</TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages">
            <MessageTab />
          </TabsContent>
          
          <TabsContent value="search">
            <UserSearchTab onSelectUser={handleSelectUser} />
          </TabsContent>
        </Tabs>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Messages;
