
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
      
      // The problem is here - we can't use OR with multiple field conditions like this
      // Firestore doesn't support this type of complex query with OR
      // Let's simplify the query and then filter results in memory
      
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      // Query by displayName (which is most likely to be used)
      const q = query(
        usersRef,
        where('displayName_lower', '>=', lowerSearchTerm),
        where('displayName_lower', '<=', lowerSearchTerm + '\uf8ff'),
        limit(50) // Get more results so we can filter them
      );
      
      const querySnapshot = await getDocs(q);
      
      const foundUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Only add if something matches - additional filter in memory
        if (
          (data.displayName?.toLowerCase().includes(lowerSearchTerm)) || 
          (data.email?.toLowerCase().includes(lowerSearchTerm)) ||
          (data.location?.toLowerCase().includes(lowerSearchTerm))
        ) {
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
        }
      });
      
      // Limit to the maximum number of results
      setUsers(foundUsers.slice(0, maxResults));
      
      // Log for debugging
      console.log(`Found ${foundUsers.length} users for search term: ${searchTerm}`);
      
      if (foundUsers.length === 0) {
        // If no results with displayName, try a more general search
        const generalQuery = query(
          usersRef,
          limit(100)
        );
        
        const generalSnapshot = await getDocs(generalQuery);
        const generalResults: UserProfile[] = [];
        
        generalSnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Check all fields for matches
          if (
            (data.displayName?.toLowerCase().includes(lowerSearchTerm)) || 
            (data.email?.toLowerCase().includes(lowerSearchTerm)) ||
            (data.location?.toLowerCase().includes(lowerSearchTerm))
          ) {
            generalResults.push({
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
          }
        });
        
        console.log(`Found ${generalResults.length} users in general search for: ${searchTerm}`);
        setUsers(generalResults.slice(0, maxResults));
      }
      
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
