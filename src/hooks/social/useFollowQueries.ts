
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFollowBase } from './useFollowBase';

export const useFollowQueries = () => {
  const { user, setFollowing, setFollowers, setLoading } = useFollowBase();
  
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
  
  return {
    fetchFollowing,
    fetchFollowers
  };
};
