
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { UserProfile } from '@/types/social';

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Buscar perfil de usuário
  const fetchUserProfile = async (profileId: string = userId || user?.uid || '') => {
    if (!profileId) return null;
    
    try {
      setLoading(true);
      const userRef = doc(db, 'users', profileId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        const userProfile: UserProfile = {
          uid: profileId,
          displayName: userData.displayName || null,
          photoURL: userData.photoURL || null,
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          followers: userData.followers || 0,
          following: userData.following || 0,
          posts: userData.posts || 0
        };
        
        setProfile(userProfile);
        return userProfile;
      } else {
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar perfil de usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o perfil do usuário',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Atualizar perfil do usuário atual
  const updateUserProfile = async (data: Partial<UserProfile>, profileImage?: File) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      let photoURL = user.photoURL;
      
      // Upload da nova foto de perfil, se fornecida
      if (profileImage) {
        const storageRef = ref(storage, `profile/${user.uid}/${Date.now()}_${profileImage.name}`);
        await uploadBytes(storageRef, profileImage);
        photoURL = await getDownloadURL(storageRef);
      }
      
      // Dados a serem atualizados
      const updatedData = {
        ...data,
        photoURL: profileImage ? photoURL : data.photoURL || user.photoURL
      };
      
      // Remover campos não permitidos
      delete updatedData.uid;
      delete updatedData.followers;
      delete updatedData.following;
      delete updatedData.posts;
      
      // Atualizar perfil no Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updatedData);
      
      // Atualizar o estado local
      if (profile) {
        setProfile({
          ...profile,
          ...updatedData,
          photoURL: updatedData.photoURL as string | null
        });
      }
      
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Inicializar perfil quando o componente for montado
  useEffect(() => {
    const targetUserId = userId || user?.uid;
    if (targetUserId) {
      fetchUserProfile(targetUserId);
    }
  }, [userId, user]);
  
  return {
    profile,
    loading,
    fetchUserProfile,
    updateUserProfile
  };
};
