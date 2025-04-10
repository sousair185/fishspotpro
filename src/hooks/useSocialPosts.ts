
import { useEffect } from 'react';
import { useSocialPostsBase } from './social/useSocialPostsBase';
import { useCreatePost } from './social/useCreatePost';
import { usePostInteractions } from './social/usePostInteractions';
import { usePostManagement } from './social/usePostManagement';

export const useSocialPosts = () => {
  const base = useSocialPostsBase();
  const { createPost } = useCreatePost();
  const { likePost, checkIfLiked } = usePostInteractions();
  const { deletePost } = usePostManagement();
  
  // Efeito para buscar postagens do usuário atual quando o componente for montado
  useEffect(() => {
    if (base.user) {
      base.fetchUserPosts(base.user.uid);
      base.fetchFeed(base.user.uid);
    }
  }, [base.user]);
  
  return {
    posts: base.posts,
    feedPosts: base.feedPosts,
    loading: base.loading,
    fetchUserPosts: base.fetchUserPosts,
    fetchMorePosts: base.fetchMorePosts,
    fetchFeed: base.fetchFeed,
    createPost,
    likePost,
    checkIfLiked,
    deletePost
  };
};
