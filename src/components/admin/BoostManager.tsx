
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, where, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FishingSpot } from '@/types/spot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Rocket, MapPin, Calendar, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

export const BoostManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [spotIdToBoot, setSpotIdToBoot] = useState('');
  const [boostDuration, setBoostDuration] = useState(7); // Default 7 days

  // Fetch currently boosted spots
  const { data: boostedSpots, isLoading: loadingBoosted, refetch: refetchBoosted } = useQuery({
    queryKey: ['spots', 'boosted'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const spotsRef = collection(db, 'spots');
      const q = query(
        spotsRef, 
        where('status', '==', 'approved'),
        orderBy('boosted.endDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as FishingSpot)
        .filter(spot => spot.boosted && spot.boosted.endDate > now);
    }
  });

  // Mutation to boost a spot
  const boostMutation = useMutation({
    mutationFn: async ({ spotId, duration }: { spotId: string; duration: number }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const spotRef = doc(db, 'spots', spotId);
      const startDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      
      await updateDoc(spotRef, {
        'boosted': {
          startDate,
          endDate: endDate.toISOString(),
          boostedBy: user.uid
        }
      });
      
      return { spotId, startDate, endDate: endDate.toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots'] });
      queryClient.invalidateQueries({ queryKey: ['spots', 'boosted'] });
      queryClient.invalidateQueries({ queryKey: ['popularSpots'] });
      
      toast({
        title: "Spot impulsionado com sucesso",
        description: `O spot foi impulsionado por ${boostDuration} dias e aparecerá em destaque`,
      });
      
      setSpotIdToBoot('');
    },
    onError: (error) => {
      toast({
        title: "Erro ao impulsionar spot",
        description: "Certifique-se de que o ID do spot está correto e tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutation to remove boost from a spot
  const removeBoostMutation = useMutation({
    mutationFn: async (spotId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const spotRef = doc(db, 'spots', spotId);
      await updateDoc(spotRef, {
        'boosted': null
      });
      
      return { spotId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots'] });
      queryClient.invalidateQueries({ queryKey: ['spots', 'boosted'] });
      queryClient.invalidateQueries({ queryKey: ['popularSpots'] });
      
      toast({
        title: "Impulso removido com sucesso",
        description: "O spot não aparecerá mais em destaque",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover impulso",
        description: "Ocorreu um erro, tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

  const handleBoostSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotIdToBoot.trim()) {
      toast({
        title: "ID do spot é obrigatório",
        description: "Insira o ID do spot que deseja impulsionar",
        variant: "destructive"
      });
      return;
    }
    
    boostMutation.mutate({ spotId: spotIdToBoot, duration: boostDuration });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Impulsionar Novo Spot
          </CardTitle>
          <CardDescription>
            Spots impulsionados aparecem em destaque na listagem de spots populares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBoostSpot} className="space-y-4">
            <div>
              <label htmlFor="spotId" className="block text-sm font-medium mb-1">
                ID do Spot
              </label>
              <Input
                id="spotId"
                value={spotIdToBoot}
                onChange={(e) => setSpotIdToBoot(e.target.value)}
                placeholder="ID do spot que deseja impulsionar"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Você pode encontrar o ID de um spot na página de administração, na aba de spots aprovados.
              </p>
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Duração (dias)
              </label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={30}
                value={boostDuration}
                onChange={(e) => setBoostDuration(Number(e.target.value))}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={boostMutation.isPending}
            >
              {boostMutation.isPending ? 'Impulsionando...' : 'Impulsionar Spot'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Spots Impulsionados</CardTitle>
            <CardDescription>
              Gerenciar spots atualmente em destaque
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refetchBoosted()}
            disabled={loadingBoosted}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingBoosted ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Carregando spots impulsionados...</p>
            </div>
          ) : !boostedSpots || boostedSpots.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhum spot impulsionado no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {boostedSpots.map((spot) => (
                <div 
                  key={spot.id}
                  className="border rounded-md p-4 flex justify-between items-start bg-amber-50/10"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{spot.name}</h4>
                      <Badge className="bg-amber-100 text-amber-800">Impulsionado</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {spot.description.substring(0, 100)}{spot.description.length > 100 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {spot.type === 'establishment' ? 'Estabelecimento' : 'Ponto de pesca'}
                      </span>
                      <span className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Até {new Date(spot.boosted!.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBoostMutation.mutate(spot.id)}
                    disabled={removeBoostMutation.isPending}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
