
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useUserProfile } from '@/hooks/useUserProfile';
import Navbar from '@/components/layout/Navbar';
import UserProfileCard from '@/components/social/UserProfileCard';
import CreatePostForm from '@/components/social/CreatePostForm';
import PostCard from '@/components/social/PostCard';
import EditProfileForm from '@/components/social/EditProfileForm';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Social = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { 
    posts, 
    feedPosts, 
    loading: postsLoading, 
    fetchUserPosts, 
    fetchFeed 
  } = useSocialPosts();
  const { 
    profile, 
    loading: profileLoading, 
    fetchUserProfile 
  } = useUserProfile();
  
  // Efeito para buscar dados do perfil e postagens
  useEffect(() => {
    if (user && !authLoading) {
      fetchUserProfile(user.uid);
    }
  }, [user, authLoading]);
  
  // Função para atualizar as postagens
  const refreshPosts = () => {
    if (user) {
      if (activeTab === 'profile') {
        fetchUserPosts(user.uid);
      } else {
        fetchFeed(user.uid);
      }
    }
  };
  
  // Lidar com a criação de uma nova postagem
  const handlePostCreated = () => {
    refreshPosts();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Entre para ver as postagens</h1>
          <p className="mb-6">Faça login para acessar o feed social.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Feed Social</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed">
            <div className="space-y-6">
              <CreatePostForm onPostCreated={handlePostCreated} />
              
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Postagens Recentes</h2>
                <Button variant="ghost" size="sm" onClick={() => fetchFeed(user.uid)}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
                </Button>
              </div>
              
              <Separator />
              
              {postsLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando postagens...</p>
                </div>
              ) : feedPosts.length > 0 ? (
                <div className="space-y-4">
                  {feedPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhuma postagem encontrada.</p>
                  <p className="text-sm">Siga mais pessoas para ver postagens no seu feed.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <div className="space-y-6">
              <UserProfileCard 
                profile={profile} 
                loading={profileLoading} 
                onEditProfile={() => setIsEditProfileOpen(true)} 
              />
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Minhas Postagens</h2>
                <Button variant="ghost" size="sm" onClick={() => fetchUserPosts(user.uid)}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
                </Button>
              </div>
              
              <CreatePostForm onPostCreated={handlePostCreated} />
              
              {postsLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando postagens...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Você ainda não fez nenhuma postagem.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <EditProfileForm 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        currentProfile={profile} 
      />
      
      <Navbar />
    </div>
  );
};

export default Social;
