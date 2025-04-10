
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { Post } from '@/types/social';
import { useSocialPostsBase } from './useSocialPostsBase';

export const useCreatePost = () => {
  const { posts, setPosts, user, toast } = useSocialPostsBase();
  
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
  
  return { createPost };
};
