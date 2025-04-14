
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from 'lucide-react';
import { FishingSpot } from '@/types/spot';

interface SpotCardProps {
  spot: FishingSpot;
  activeTab: string;
  onApprove: (spotId: string) => void;
  onReject: (spotId: string) => void;
  isPending: boolean;
}

const SpotCard: React.FC<SpotCardProps> = ({ 
  spot, 
  activeTab, 
  onApprove, 
  onReject, 
  isPending 
}) => {
  return (
    <Card key={spot.id} className="mb-4">
      <CardHeader>
        <CardTitle>{spot.name}</CardTitle>
        <CardDescription>
          Criado em: {new Date(spot.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-2">{spot.description}</p>
        <p className="text-sm">Espécies: {spot.species.join(', ')}</p>
        <p className="text-sm">Coordenadas: {spot.coordinates[1]}, {spot.coordinates[0]}</p>
        <p className="text-sm font-medium mt-1">ID: {spot.id}</p>
        
        {spot.images && spot.images.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {spot.images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Foto ${index + 1} do spot`}
                className="w-32 h-32 object-cover rounded-md"
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {activeTab === 'pending' && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onReject(spot.id)}
              disabled={isPending}
            >
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Rejeitar
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onApprove(spot.id)}
              disabled={isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprovar
            </Button>
          </>
        )}
        {activeTab === 'rejected' && (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onApprove(spot.id)}
            disabled={isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Aprovar mesmo assim
          </Button>
        )}
        {activeTab === 'approved' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onReject(spot.id)}
            disabled={isPending}
          >
            <XCircle className="mr-2 h-4 w-4 text-red-500" />
            Revogar aprovação
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SpotCard;
