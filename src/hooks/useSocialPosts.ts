
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, deleteDoc, doc, increment, getDoc, startAfter } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Post } from '@/types/social';

export const useSocialPosts = () => {
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
  
  // Criar uma nova postagem
  const createPost = async (content: string, image?: File) => {
    if (!user) return null;
    
    try {
      let imageURL;
      
      // Upload da imagem, se houver
      if (image) {
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        imageURL = await getDownloadURL(storageRef);
      }
      
      // Criar a postagem
      const postData = {
        userId: user.uid,
        userName: user.displayName || 'Usuário',
        userPhotoURL: user.photoURL,
        content,
        imageURL,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0
      };
      
      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      // Atualizar a contagem de postagens do usuário
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        posts: increment(1)
      });
      
      // Adicionar a nova postagem à lista
      const newPost = { id: docRef.id, ...postData } as Post;
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      toast({
        title: 'Sucesso',
        description: 'Postagem criada com sucesso'
      });
      
      return newPost;
    } catch (error) {
      console.error('Erro ao criar postagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a postagem',
        variant: 'destructive'
      });
      return null;
    }
  };
  
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
  
  // Efeito para buscar postagens do usuário atual quando o componente for montado
  useEffect(() => {
    if (user) {
      fetchUserPosts(user.uid);
      fetchFeed(user.uid);
    }
  }, [user]);
  
  return {
    posts,
    feedPosts,
    loading,
    fetchUserPosts,
    fetchMorePosts,
    fetchFeed,
    createPost,
    likePost,
    checkIfLiked,
    deletePost
  };
};
