
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Follow } from '@/types/social';

export const useFollow = () => {
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Buscar usuários que o usuário atual segue
  const fetchFollowing = async (userId: string = user?.uid || '') => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('followerId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const followingIds = snapshot.docs.map(doc => doc.data().followingId);
      
      setFollowing(followingIds);
    } catch (error) {
      console.error('Erro ao buscar usuários seguidos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar seguidores do usuário atual
  const fetchFollowers = async (userId: string = user?.uid || '') => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('followingId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const followerIds = snapshot.docs.map(doc => doc.data().followerId);
      
      setFollowers(followerIds);
    } catch (error) {
      console.error('Erro ao buscar seguidores:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Seguir um usuário
  const followUser = async (userId: string) => {
    if (!user || userId === user.uid) return false;
    
    try {
      // Verificar se já está seguindo
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('followerId', '==', user.uid),
        where('followingId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        toast({
          title: 'Atenção',
          description: 'Você já está seguindo este usuário'
        });
        return false;
      }
      
      // Adicionar relação de seguir
      const followData = {
        followerId: user.uid,
        followingId: userId,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'follows'), followData);
      
      // Atualizar contadores
      const currentUserRef = doc(db, 'users', user.uid);
      await updateDoc(currentUserRef, {
        following: increment(1)
      });
      
      const targetUserRef = doc(db, 'users', userId);
      await updateDoc(targetUserRef, {
        followers: increment(1)
      });
      
      // Atualizar estado local
      setFollowing(prev => [...prev, userId]);
      
      toast({
        title: 'Sucesso',
        description: 'Você começou a seguir este usuário'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível seguir este usuário',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Deixar de seguir um usuário
  const unfollowUser = async (userId: string) => {
    if (!user) return false;
    
    try {
      // Buscar a relação de seguir
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('followerId', '==', user.uid),
        where('followingId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast({
          title: 'Atenção',
          description: 'Você não está seguindo este usuário'
        });
        return false;
      }
      
      // Remover relação de seguir
      await deleteDoc(doc(db, 'follows', snapshot.docs[0].id));
      
      // Atualizar contadores
      const currentUserRef = doc(db, 'users', user.uid);
      await updateDoc(currentUserRef, {
        following: increment(-1)
      });
      
      const targetUserRef = doc(db, 'users', userId);
      await updateDoc(targetUserRef, {
        followers: increment(-1)
      });
      
      // Atualizar estado local
      setFollowing(prev => prev.filter(id => id !== userId));
      
      toast({
        title: 'Sucesso',
        description: 'Você deixou de seguir este usuário'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deixar de seguir este usuário',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Verificar se o usuário atual segue outro usuário
  const isFollowing = (userId: string) => {
    return following.includes(userId);
  };
  
  // Inicializar os dados quando o usuário for definido
  useEffect(() => {
    if (user) {
      fetchFollowing();
      fetchFollowers();
    }
  }, [user]);
  
  return {
    following,
    followers,
    loading,
    fetchFollowing,
    fetchFollowers,
    followUser,
    unfollowUser,
    isFollowing
  };
};
