
import React, { useState } from 'react';
import Navbar from "../components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FishingSpot } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Bell, Rocket } from 'lucide-react';
import { NotificationManager } from '@/components/admin/NotificationManager';
import { BoostManager } from '@/components/admin/BoostManager';
import { NotificationBanner } from '@/components/notifications/NotificationBanner';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");

  // Buscar spots pendentes
  const { data: pendingSpots, isLoading: pendingLoading } = useQuery({
    queryKey: ['spots', 'pending'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      const spotsRef = collection(db, 'spots');
      const q = query(spotsRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FishingSpot[];
    },
    enabled: isAdmin
  });

  // Buscar spots rejeitados
  const { data: rejectedSpots, isLoading: rejectedLoading } = useQuery({
    queryKey: ['spots', 'rejected'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      const spotsRef = collection(db, 'spots');
      const q = query(spotsRef, where('status', '==', 'rejected'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FishingSpot[];
    },
    enabled: isAdmin
  });

  // Buscar spots aprovados
  const { data: approvedSpots, isLoading: approvedLoading } = useQuery({
    queryKey: ['spots', 'approved'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      const spotsRef = collection(db, 'spots');
      const q = query(spotsRef, where('status', '==', 'approved'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FishingSpot[];
    },
    enabled: isAdmin
  });

  // Mutation para aprovar/rejeitar spots
  const mutation = useMutation({
    mutationFn: async ({ spotId, status }: { spotId: string, status: 'approved' | 'rejected' }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const spotRef = doc(db, 'spots', spotId);
      await updateDoc(spotRef, {
        status,
        reviewedBy: user.uid,
        reviewedAt: new Date().toISOString()
      });
      
      return { spotId, status };
    },
    onSuccess: (data) => {
      // Atualizar cache após a mutação
      queryClient.invalidateQueries({ queryKey: ['spots'] });
      queryClient.invalidateQueries({ queryKey: ['spots', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['spots', 'approved'] });
      queryClient.invalidateQueries({ queryKey: ['spots', 'rejected'] });
      
      toast({
        title: `Spot ${data.status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso`,
        description: `O spot foi ${data.status === 'approved' ? 'aprovado' : 'rejeitado'} e ${data.status === 'approved' ? 'já está' : 'não será'} visível no mapa`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar spot",
        description: "Ocorreu um erro, tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

  // Função para aprovar spot
  const handleApprove = (spotId: string) => {
    mutation.mutate({ spotId, status: 'approved' });
  };

  // Função para rejeitar spot
  const handleReject = (spotId: string) => {
    mutation.mutate({ spotId, status: 'rejected' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
        <main className="pb-20 px-6">
          <header className="p-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Administração</h1>
            <p className="text-muted-foreground">Faça login para acessar esta página</p>
          </header>
        </main>
        <Navbar />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
        <main className="pb-20 px-6">
          <header className="p-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Acesso Restrito</h1>
            <p className="text-muted-foreground">Esta página é apenas para administradores.</p>
          </header>
        </main>
        <Navbar />
      </div>
    );
  }

  // Renderizar cartões de spot
  const renderSpotCards = (spots: FishingSpot[] = []) => {
    if (!spots || spots.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          Nenhum spot encontrado nesta categoria.
        </div>
      );
    }

    return spots.map(spot => (
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
                onClick={() => handleReject(spot.id)}
                disabled={mutation.isPending}
              >
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Rejeitar
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleApprove(spot.id)}
                disabled={mutation.isPending}
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
              onClick={() => handleApprove(spot.id)}
              disabled={mutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprovar mesmo assim
            </Button>
          )}
          {activeTab === 'approved' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleReject(spot.id)}
              disabled={mutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Revogar aprovação
            </Button>
          )}
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Notification Banner */}
      <NotificationBanner />
      
      <main className="pb-20 px-6 pt-16">
        <header className="p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Administração</h1>
          <p className="text-muted-foreground">Gerencie spots, notificações e destaques do sistema</p>
        </header>

        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="pending" className="relative">
              Spots Pendentes
              {pendingSpots && pendingSpots.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {pendingSpots.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Spots Aprovados</TabsTrigger>
            <TabsTrigger value="rejected">Spots Rejeitados</TabsTrigger>
            <TabsTrigger value="notifications">
              <span className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                Notif.
              </span>
            </TabsTrigger>
            <TabsTrigger value="boosts">
              <span className="flex items-center gap-1">
                <Rocket className="h-4 w-4" />
                Destaques
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {pendingLoading ? (
              <div className="py-8 text-center">Carregando spots pendentes...</div>
            ) : (
              renderSpotCards(pendingSpots)
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-4">
            {approvedLoading ? (
              <div className="py-8 text-center">Carregando spots aprovados...</div>
            ) : (
              renderSpotCards(approvedSpots)
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-4">
            {rejectedLoading ? (
              <div className="py-8 text-center">Carregando spots rejeitados...</div>
            ) : (
              renderSpotCards(rejectedSpots)
            )}
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-4">
            <NotificationManager />
          </TabsContent>
          
          <TabsContent value="boosts" className="mt-4">
            <BoostManager />
          </TabsContent>
        </Tabs>
      </main>
      <Navbar />
    </div>
  );
};

export default Admin;
