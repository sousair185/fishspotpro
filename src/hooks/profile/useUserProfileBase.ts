
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '../useAuth';
import { useToast } from '../use-toast';
import { UserProfile } from '@/types/social';

export const useUserProfileBase = (userId?: string) => {
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
          email: userData.email || null,
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

  // Inicializar perfil quando o componente for montado
  useEffect(() => {
    const targetUserId = userId || user?.uid;
    if (targetUserId) {
      fetchUserProfile(targetUserId);
    }
  }, [userId, user]);

  return {
    profile,
    setProfile,
    loading,
    setLoading,
    user,
    toast,
    fetchUserProfile
  };
};
