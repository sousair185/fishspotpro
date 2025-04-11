
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { useUserProfileBase } from './useUserProfileBase';
import { UserProfile } from '@/types/social';

export const useUserProfileActions = (userId?: string) => {
  const { profile, setProfile, loading, setLoading, user, toast } = useUserProfileBase(userId);

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

  return {
    profile,
    loading,
    updateUserProfile
  };
};
