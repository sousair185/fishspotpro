
import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { FishingSpot } from '@/types/spot';
import { SpotLike } from './SpotLike';
import { SpotShare } from './SpotShare';
import { SpotBoost } from './SpotBoost';
import { Rocket, ThumbsUp, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SpotInfoWindowProps {
  spot: FishingSpot;
  isAdmin: boolean;
  onClose: () => void;
  onLikeUpdate?: () => void;
}

export function SpotInfoWindow({ spot, isAdmin, onClose, onLikeUpdate }: SpotInfoWindowProps) {
  console.log("Rendering InfoWindow for spot:", spot.name);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handleLikeUpdate = () => {
    console.log("Like updated for spot:", spot.name);
    queryClient.invalidateQueries({ queryKey: ['spots'] });
    queryClient.invalidateQueries({ queryKey: ['popularSpots'] });
    if (onLikeUpdate) {
      onLikeUpdate();
    }
  };
  
  return (
    <InfoWindow
      position={{ lat: spot.coordinates[1], lng: spot.coordinates[0] }}
      onCloseClick={onClose}
      options={{ maxWidth: 320 }}
    >
      <div className="p-3 max-w-[300px]">
        <h3 className="font-bold text-lg mb-1">{spot.name}</h3>
        <p className="text-sm mb-2">{spot.description}</p>
        
        {spot.type === 'establishment' ? (
          <p className="text-xs mt-1">Categorias: {spot.species.join(', ')}</p>
        ) : (
          <p className="text-xs mt-1">Espécies: {spot.species.join(', ')}</p>
        )}
        
        {isAdmin && (
          <p className="text-xs mt-1 font-semibold" style={{
            color: spot.status === 'approved' ? 'green' : 
                  spot.status === 'pending' ? 'orange' : 'red'
          }}>
            Status: {
              spot.status === 'approved' ? 'Aprovado' : 
              spot.status === 'pending' ? 'Pendente' : 'Rejeitado'
            }
          </p>
        )}

        {spot.boosted && new Date(spot.boosted.endDate) > new Date() && (
          <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
            <Rocket className="h-3 w-3" />
            <span>Spot em destaque</span>
          </div>
        )}

        {spot.images && spot.images.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {spot.images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="Foto do spot"
                className="w-20 h-20 object-cover rounded"
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <SpotLike
              spotId={spot.id}
              likes={spot.likes || []}
              likeCount={spot.likeCount || 0}
              onLikeUpdate={handleLikeUpdate}
            />
            <SpotShare spot={spot} />
          </div>
          {user && (
            <SpotBoost
              spotId={spot.id}
              boosted={spot.boosted}
              onBoostUpdate={handleLikeUpdate}
            />
          )}
        </div>
      </div>
    </InfoWindow>
  );
}
