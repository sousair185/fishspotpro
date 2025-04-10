
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, increment, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSocialPostsBase } from './useSocialPostsBase';

export const usePostInteractions = () => {
  const { posts, setPosts, feedPosts, setFeedPosts, user, toast } = useSocialPostsBase();
  
  // Curtir uma postagem
  const likePost = async (postId: string) => {
    if (!user) return false;
    
    try {
      // Verificar se o usuário já curtiu essa postagem
      const likeRef = doc(db, 'likes', `${user.uid}_${postId}`);
      const likeDoc = await getDoc(likeRef);
      
      if (likeDoc.exists()) {
        // Se já curtiu, remover a curtida
        await deleteDoc(likeRef);
        
        // Atualizar a contagem de curtidas da postagem
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likes: increment(-1)
        });
        
        // Atualizar o estado local
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return { ...post, likes: post.likes - 1 };
          }
          return post;
        }));
        
        setFeedPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return { ...post, likes: post.likes - 1 };
          }
          return post;
        }));
        
        return false; // Retorna false indicando que a postagem não está mais curtida
      } else {
        // Se ainda não curtiu, adicionar a curtida
        await addDoc(collection(db, 'likes'), {
          userId: user.uid,
          postId,
          createdAt: new Date().toISOString()
        });
        
        // Atualizar a contagem de curtidas da postagem
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likes: increment(1)
        });
        
        // Atualizar o estado local
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return { ...post, likes: post.likes + 1 };
          }
          return post;
        }));
        
        setFeedPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return { ...post, likes: post.likes + 1 };
          }
          return post;
        }));
        
        return true; // Retorna true indicando que a postagem está curtida
      }
    } catch (error) {
      console.error('Erro ao curtir postagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível curtir a postagem',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Verificar se o usuário curtiu uma postagem
  const checkIfLiked = async (postId: string) => {
    if (!user) return false;
    
    try {
      const likeRef = doc(db, 'likes', `${user.uid}_${postId}`);
      const likeDoc = await getDoc(likeRef);
      
      return likeDoc.exists();
    } catch (error) {
      console.error('Erro ao verificar curtida:', error);
      return false;
    }
  };
  
  return { likePost, checkIfLiked };
};
