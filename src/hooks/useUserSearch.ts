
import { useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';
import { UserProfile } from '@/types/social';

export const useUserSearch = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchUsers = async (searchTerm: string, maxResults: number = 10) => {
    if (!searchTerm || searchTerm.length < 3) {
      toast({
        title: 'Busca muito curta',
        description: 'Digite pelo menos 3 caracteres para buscar',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      
      // Criando uma pesquisa com OR para diversos campos
      const lowerSearchTerm = searchTerm.toLowerCase();
      const q = query(
        usersRef,
        or(
          where('displayName_lower', '>=', lowerSearchTerm),
          where('displayName_lower', '<=', lowerSearchTerm + '\uf8ff'),
          where('email_lower', '>=', lowerSearchTerm),
          where('email_lower', '<=', lowerSearchTerm + '\uf8ff'),
          where('location_lower', '>=', lowerSearchTerm),
          where('location_lower', '<=', lowerSearchTerm + '\uf8ff')
        ),
        limit(maxResults)
      );
      
      const querySnapshot = await getDocs(q);
      
      const foundUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        foundUsers.push({
          uid: doc.id,
          displayName: data.displayName || null,
          photoURL: data.photoURL || null,
          email: data.email || null,
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          followers: data.followers || 0,
          following: data.following || 0,
          posts: data.posts || 0
        });
      });
      
      setUsers(foundUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar a busca de usuários',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    searchUsers
  };
};
