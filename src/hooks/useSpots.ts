
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FishingSpot } from "@/types/spot";
import { User } from "firebase/auth";

export const useSpots = (user: User | null) => {
  // Fetch user's spots
  const { 
    data: userSpots, 
    isLoading: isLoadingUserSpots 
  } = useQuery({
    queryKey: ['userSpots', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      const spotsRef = collection(db, 'spots');
      const q = query(spotsRef, where('createdBy', '==', user.uid));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FishingSpot[];
    },
    enabled: !!user
  });

  // Fetch spots liked by the user
  const { 
    data: likedSpots, 
    isLoading: isLoadingLikedSpots 
  } = useQuery({
    queryKey: ['likedSpots', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      const spotsRef = collection(db, 'spots');
      const q = query(spotsRef, where('likes', 'array-contains', user.uid));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FishingSpot[];
    },
    enabled: !!user
  });

  return {
    userSpots,
    likedSpots,
    isLoadingUserSpots,
    isLoadingLikedSpots
  };
};
