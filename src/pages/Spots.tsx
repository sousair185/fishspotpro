
import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FishingSpot } from "@/types/spot";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Users } from "lucide-react";

const Spots = () => {
  const { user, isVip } = useAuth();

  // Buscar spots do usuário
  const { data: userSpots, isLoading } = useQuery({
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

  // Contar spots privados
  const privateSpots = userSpots?.filter(spot => spot.isPrivate).length || 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
        <main className="pb-20">
          <header className="p-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pontos de Pesca</h1>
            <p className="text-muted-foreground">Faça login para visualizar seus spots</p>
          </header>
        </main>
        <Navbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      <main className="pb-20">
        <header className="p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pontos de Pesca</h1>
          <p className="text-muted-foreground">Gerencie seus pontos cadastrados</p>
        </header>

        <section className="px-6">
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
          ) : !userSpots || userSpots.length === 0 ? (
            <div className="rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 p-8 text-center">
              <p className="text-muted-foreground">Você ainda não cadastrou nenhum ponto de pesca</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userSpots.map(spot => (
                <Card key={spot.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <CardTitle>{spot.name}</CardTitle>
                        {spot.isPrivate && <Lock className="h-4 w-4 text-purple-500" />}
                      </div>
                      <Badge className={getStatusColor(spot.status, spot.isPrivate)}>
                        {getStatusText(spot.status, spot.isPrivate)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Criado em: {new Date(spot.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">{spot.description}</p>
                    <p className="text-sm">Espécies: {spot.species.join(', ')}</p>
                    
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

                    {spot.isPrivate && (
                      <div className="mt-4 bg-purple-50 p-3 rounded-md text-purple-800 text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <div>
                          <strong>Spot Privativo:</strong> Este spot é visível apenas para você.
                        </div>
                      </div>
                    )}

                    {!spot.isPrivate && spot.status === 'rejected' && (
                      <div className="mt-4 bg-red-50 p-3 rounded-md text-red-800 text-sm">
                        <strong>Nota:</strong> Este spot foi rejeitado pela administração. Verifique as informações e tente cadastrar novamente.
                      </div>
                    )}

                    {!spot.isPrivate && spot.status === 'pending' && (
                      <div className="mt-4 bg-yellow-50 p-3 rounded-md text-yellow-800 text-sm">
                        <strong>Nota:</strong> Este spot está em análise e será visível no mapa após aprovação pela administração.
                      </div>
                    )}

                    {!spot.isPrivate && spot.status === 'approved' && (
                      <div className="mt-4 bg-green-50 p-3 rounded-md text-green-800 text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <strong>Spot Público:</strong> Este spot é visível para todos os usuários.
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Navbar />
    </div>
  );
};

export default Spots;
