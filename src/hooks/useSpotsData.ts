
import { useState, useEffect } from 'react';
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

  const { data: fetchedSpots } = useQuery({
    queryKey: ['spots', user?.uid],
    queryFn: async () => {
      console.log("Fetching spots data, user:", user?.uid);
      const spotsCollection = collection(db, 'spots');
      
      let spotsSnapshot;
      
      if (isAdmin) {
        // Admins veem todos os spots
        console.log("Admin user - fetching all spots");
        spotsSnapshot = await getDocs(spotsCollection);
      } else if (user) {
        // Usuários logados veem spots aprovados e seus próprios spots privados
        console.log("Logged in user - fetching approved spots and own spots");
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
        console.log("Guest user - fetching only approved spots");
        spotsSnapshot = await getDocs(
          query(spotsCollection, where('status', '==', 'approved'))
        );
      }
      
      const spotsData = spotsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FishingSpot[];
      
      console.log(`Fetched ${spotsData.length} spots from Firestore`);
      return spotsData;
    },
    enabled: isLoaded
  });

  // Update spots whenever new data is fetched
  useEffect(() => {
    if (fetchedSpots && fetchedSpots.length > 0) {
      console.log("Updating spots with fetched data:", fetchedSpots.length);
      // Merge with initial spots, avoiding duplicates by ID
      const spotIds = new Set(initialSpots.map(spot => spot.id));
      const uniqueFetchedSpots = fetchedSpots.filter(spot => !spotIds.has(spot.id));
      setSpots([...initialSpots, ...uniqueFetchedSpots]);
    }
  }, [fetchedSpots, initialSpots]);

  return { spots, setSpots };
};
