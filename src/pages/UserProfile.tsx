
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useFollow } from '@/hooks/useFollow';
import Navbar from '@/components/layout/Navbar';
import UserProfileCard from '@/components/social/UserProfileCard';
import PostCard from '@/components/social/PostCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { profile, loading: profileLoading } = useUserProfile(userId);
  const { posts, loading: postsLoading, fetchUserPosts } = useSocialPosts();
  const { isFollowing } = useFollow();
  
  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId);
    }
  }, [userId]);
  
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Usuário não encontrado</h1>
          <Link to="/social">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/social" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
        </div>
        
        <div className="space-y-6">
          <UserProfileCard profile={profile} loading={profileLoading} />
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Postagens</h2>
            <Button variant="ghost" size="sm" onClick={() => userId && fetchUserPosts(userId)}>
              <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
            </Button>
          </div>
          
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
              <p className="text-muted-foreground">Este usuário ainda não fez nenhuma postagem.</p>
              {isFollowing(userId) && (
                <p className="text-sm mt-2">Você receberá notificações quando {profile?.displayName || 'este usuário'} fizer uma nova postagem.</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Navbar />
    </div>
  );
};

export default UserProfile;
