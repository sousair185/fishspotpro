
import React from "react";
import { FishingSpot } from "@/types/spot";
import { Lock } from "lucide-react";
import { SpotCard } from "./SpotCard";

interface MySpotsTabProps {
  spots: FishingSpot[] | undefined;
  isLoading: boolean;
  isVip: boolean;
  onSpotClick: (spot: FishingSpot) => void;
}

export const MySpotsTab: React.FC<MySpotsTabProps> = ({ 
  spots, 
  isLoading, 
  isVip, 
  onSpotClick 
}) => {
  // Contar spots privados
  const privateSpots = spots?.filter(spot => spot.isPrivate).length || 0;

  return (
    <>
      {!isLoading && privateSpots > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-purple-50 border border-purple-200">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Spots Privativos: {privateSpots}/
              {isVip ? "∞" : "2"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isVip 
              ? "Como usuário VIP, você pode adicionar quantos spots privativos quiser." 
              : "Usuários comuns podem adicionar até 2 spots privativos."}
          </p>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">Carregando seus spots...</div>
      ) : !spots || spots.length === 0 ? (
        <div className="rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 p-8 text-center">
          <p className="text-muted-foreground">Você ainda não cadastrou nenhum ponto de pesca</p>
        </div>
      ) : (
        <div className="space-y-4">
          {spots.map(spot => (
            <SpotCard 
              key={spot.id} 
              spot={spot} 
              onClick={onSpotClick} 
            />
          ))}
        </div>
      )}
    </>
  );
};
