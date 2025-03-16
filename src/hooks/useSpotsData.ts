
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FishingSpot } from '@/types/spot';
import { FirebaseUser } from '@/types/user';

export const useSpotsData = (
  user: FirebaseUser | null, 
  isAdmin: boolean, 
  isLoaded: boolean,
  initialSpots: FishingSpot[]
) => {
  const [spots, setSpots] = useState<FishingSpot[]>(initialSpots);

  useQuery({
    queryKey: ['spots', user?.uid],
    queryFn: async () => {
      const spotsCollection = collection(db, 'spots');
      
      let spotsSnapshot;
      
      if (isAdmin) {
        // Admins veem todos os spots
        spotsSnapshot = await getDocs(spotsCollection);
      } else if (user) {
        // Usuários logados veem spots aprovados e seus próprios spots privados
        spotsSnapshot = await getDocs(
          query(spotsCollection, 
            or(
              where('status', '==', 'approved'),
              where('createdBy', '==', user.uid)
            )
          )
        );
      } else {
        // Usuários não logados só veem spots aprovados
        spotsSnapshot = await getDocs(
          query(spotsCollection, where('status', '==', 'approved'))
        );
      }
      
      const spotsData = spotsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FishingSpot[];
      
      setSpots([...initialSpots, ...spotsData]);
      return spotsData;
    },
    enabled: isLoaded
  });

  return { spots, setSpots };
};
