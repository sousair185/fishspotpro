
import { doc, getDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSocialPostsBase } from './useSocialPostsBase';

export const usePostManagement = () => {
  const { posts, setPosts, feedPosts, setFeedPosts, user, toast } = useSocialPostsBase();
  
  // Excluir uma postagem
  const deletePost = async (postId: string) => {
    if (!user) return false;
    
    try {
      // Verificar se a postagem pertence ao usuário atual
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists() || postDoc.data().userId !== user.uid) {
        toast({
          title: 'Erro',
          description: 'Você não tem permissão para excluir esta postagem',
          variant: 'destructive'
        });
        return false;
      }
      
      // Excluir a postagem
      await deleteDoc(postRef);
      
      // Atualizar a contagem de postagens do usuário
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        posts: increment(-1)
      });
      
      // Atualizar o estado local
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setFeedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      toast({
        title: 'Sucesso',
        description: 'Postagem excluída com sucesso'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir postagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a postagem',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  return { deletePost };
};
