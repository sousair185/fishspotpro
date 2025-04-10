
import { useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, doc, increment, updateDoc, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '../useAuth';
import { useToast } from '../use-toast';
import { Post } from '@/types/social';

export const useSocialPostsBase = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Buscar postagens do usuário atual
  const fetchUserPosts = async (userId: string) => {
    try {
      setLoading(true);
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      setPosts(postsData);
      
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error('Erro ao buscar postagens:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as postagens',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar mais postagens (paginação)
  const fetchMorePosts = async (userId: string) => {
    if (!lastVisible) return;
    
    try {
      setLoading(true);
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      setPosts(prevPosts => [...prevPosts, ...postsData]);
      
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error('Erro ao buscar mais postagens:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar feed (postagens dos usuários que o usuário atual segue)
  const fetchFeed = async (userId: string) => {
    try {
      setLoading(true);
      
      // Primeiro, buscar os IDs dos usuários que o usuário atual segue
      const followingRef = collection(db, 'follows');
      const followingQuery = query(
        followingRef,
        where('followerId', '==', userId)
      );
      
      const followingSnapshot = await getDocs(followingQuery);
      const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
      
      // Se o usuário não segue ninguém, mostrar postagens populares
      if (followingIds.length === 0) {
        const popularPostsRef = collection(db, 'posts');
        const popularPostsQuery = query(
          popularPostsRef,
          orderBy('likes', 'desc'),
          limit(10)
        );
        
        const popularPostsSnapshot = await getDocs(popularPostsQuery);
        const popularPostsData = popularPostsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        
        setFeedPosts(popularPostsData);
      } else {
        // Buscar postagens dos usuários seguidos
        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef,
          where('userId', 'in', followingIds),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        
        setFeedPosts(postsData);
      }
    } catch (error) {
      console.error('Erro ao buscar feed:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o feed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return {
    posts,
    setPosts,
    feedPosts,
    setFeedPosts,
    loading,
    setLoading,
    lastVisible,
    setLastVisible,
    user,
    toast,
    fetchUserPosts,
    fetchMorePosts,
    fetchFeed
  };
};
