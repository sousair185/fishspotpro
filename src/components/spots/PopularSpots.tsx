
import React, { useState } from 'react';
import { FishingSpot } from '@/types/spot';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ThumbsUp, Rocket, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PopularSpotsProps {
  onSpotSelect?: (spot: FishingSpot) => void;
}

export const PopularSpots: React.FC<PopularSpotsProps> = ({ onSpotSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const spotsPerPage = 10;
  
  const { data: spots, isLoading } = useQuery({
    queryKey: ['popularSpots'],
    queryFn: async () => {
      const spotsCollection = collection(db, 'spots');
      const spotsQuery = query(
        spotsCollection,
        where('status', '==', 'approved'),
        where('likeCount', '>=', 1),
        orderBy('likeCount', 'desc')
      );
      
      const spotsSnapshot = await getDocs(spotsQuery);
      return spotsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FishingSpot[];
    }
  });

  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 animate-pulse">
        <h3 className="text-lg font-semibold mb-4">Spots Populares</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!spots || spots.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50">
        <h3 className="text-lg font-semibold mb-2">Spots Populares</h3>
        <p className="text-sm text-muted-foreground">
          Nenhum spot curtido ainda. Seja o primeiro a curtir!
        </p>
      </div>
    );
  }

  // Get current spots for pagination
  const indexOfLastSpot = currentPage * spotsPerPage;
  const indexOfFirstSpot = indexOfLastSpot - spotsPerPage;
  const currentSpots = spots.slice(indexOfFirstSpot, indexOfLastSpot);
  const totalPages = Math.ceil(spots.length / spotsPerPage);

  const handleSpotClick = (spot: FishingSpot) => {
    if (onSpotSelect) {
      onSpotSelect(spot);
    } else {
      // If we're not on the map page, navigate to it with the spot coordinates
      navigate(`/?lat=${spot.coordinates[1]}&lng=${spot.coordinates[0]}&spotId=${spot.id}`);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50">
      <h3 className="text-lg font-semibold mb-4">Spots Populares</h3>
      
      <div className="space-y-3">
        {currentSpots.map((spot) => {
          const isBoosted = spot.boosted && new Date(spot.boosted.endDate) > new Date();
          
          return (
            <div 
              key={spot.id}
              onClick={() => handleSpotClick(spot)}
              className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-accent/50 ${
                isBoosted ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800' : 'bg-card border border-border/50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{spot.name}</span>
                  {isBoosted && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1">
                      <Rocket className="h-3 w-3" />
                      Destaque
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{spot.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs flex items-center gap-1 text-primary">
                    <ThumbsUp className="h-3 w-3" />
                    {spot.likeCount}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {spot.type === 'establishment' ? 'Estabelecimento' : 'Ponto de pesca'}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="ml-2 shrink-0">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-4 gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
