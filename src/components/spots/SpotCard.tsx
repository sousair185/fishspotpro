
import React from "react";
import { FishingSpot } from "@/types/spot";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Users, Heart } from "lucide-react";

interface SpotCardProps {
  spot: FishingSpot;
  onClick: (spot: FishingSpot) => void;
  isLikedTab?: boolean;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot, onClick, isLikedTab = false }) => {
  const getStatusColor = (status: string, isPrivate?: boolean) => {
    if (isPrivate || status === 'private') {
      return 'bg-purple-100 text-purple-800';
    }
    
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, isPrivate?: boolean) => {
    if (isPrivate || status === 'private') {
      return 'Privado';
    }
    
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Em análise';
      case 'rejected':
        return 'Reprovado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick(spot)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle>{spot.name}</CardTitle>
            {spot.isPrivate && !isLikedTab && <Lock className="h-4 w-4 text-purple-500" />}
            {isLikedTab && <Heart className="h-4 w-4 text-red-500 fill-current" />}
          </div>
          {!isLikedTab && (
            <Badge className={getStatusColor(spot.status, spot.isPrivate)}>
              {getStatusText(spot.status, spot.isPrivate)}
            </Badge>
          )}
        </div>
        <CardDescription>
          {isLikedTab 
            ? (spot.type === 'establishment' ? 'Estabelecimento' : 'Ponto de Pesca')
            : `Criado em: ${new Date(spot.createdAt).toLocaleDateString()}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-2">{spot.description}</p>
        <p className="text-sm">
          {spot.type === 'establishment' && isLikedTab ? 'Categorias: ' : 'Espécies: '}
          {spot.species.join(', ')}
        </p>
        
        {spot.images && spot.images.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {spot.images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Foto ${index + 1} do spot`}
                className="w-24 h-24 object-cover rounded-md"
              />
            ))}
          </div>
        )}

        {!isLikedTab && spot.isPrivate && (
          <div className="mt-4 bg-purple-50 p-3 rounded-md text-purple-800 text-sm flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <div>
              <strong>Spot Privativo:</strong> Este spot é visível apenas para você.
            </div>
          </div>
        )}

        {!isLikedTab && !spot.isPrivate && spot.status === 'rejected' && (
          <div className="mt-4 bg-red-50 p-3 rounded-md text-red-800 text-sm">
            <strong>Nota:</strong> Este spot foi rejeitado pela administração. Verifique as informações e tente cadastrar novamente.
          </div>
        )}

        {!isLikedTab && !spot.isPrivate && spot.status === 'pending' && (
          <div className="mt-4 bg-yellow-50 p-3 rounded-md text-yellow-800 text-sm">
            <strong>Nota:</strong> Este spot está em análise e será visível no mapa após aprovação pela administração.
          </div>
        )}

        {!isLikedTab && !spot.isPrivate && spot.status === 'approved' && (
          <div className="mt-4 bg-green-50 p-3 rounded-md text-green-800 text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            <div>
              <strong>Spot Público:</strong> Este spot é visível para todos os usuários.
            </div>
          </div>
        )}

        {isLikedTab && (
          <div className="mt-4 bg-red-50 p-3 rounded-md text-red-800 text-sm flex items-center gap-2">
            <Heart className="h-4 w-4 fill-current" />
            <div>
              <strong>Spot Curtido:</strong> Clique para visualizar no mapa.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
