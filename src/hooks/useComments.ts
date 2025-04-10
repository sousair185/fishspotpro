
import { useState } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc, increment, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Comment } from '@/types/social';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Buscar comentários de uma postagem
  const fetchComments = async () => {
    try {
      setLoading(true);
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      
      setComments(commentsData);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os comentários',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Adicionar um comentário
  const addComment = async (content: string) => {
    if (!user) return null;
    
    try {
      // Criar o comentário
      const commentData = {
        postId,
        userId: user.uid,
        userName: user.displayName || 'Usuário',
        userPhotoURL: user.photoURL,
        content,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'comments'), commentData);
      
      // Atualizar a contagem de comentários da postagem
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: increment(1)
      });
      
      // Adicionar o novo comentário à lista
      const newComment = { id: docRef.id, ...commentData } as Comment;
      setComments(prevComments => [...prevComments, newComment]);
      
      return newComment;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  // Excluir um comentário
  const deleteComment = async (commentId: string) => {
    if (!user) return false;
    
    try {
      // Verificar se o comentário pertence ao usuário atual
      const commentRef = doc(db, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        toast({
          title: 'Erro',
          description: 'Comentário não encontrado',
          variant: 'destructive'
        });
        return false;
      }
      
      const commentData = commentDoc.data();
      
      // Permitir exclusão apenas para o autor do comentário ou admin
      if (commentData.userId !== user.uid && !user.isAdmin) {
        toast({
          title: 'Erro',
          description: 'Você não tem permissão para excluir este comentário',
          variant: 'destructive'
        });
        return false;
      }
      
      // Excluir o comentário
      await deleteDoc(commentRef);
      
      // Atualizar a contagem de comentários da postagem
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: increment(-1)
      });
      
      // Atualizar o estado local
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o comentário',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment
  };
};
