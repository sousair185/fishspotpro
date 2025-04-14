
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FishingSpot } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';
import { User } from 'firebase/auth';

export const useSpotManagement = (user: User | null, isAdmin: boolean) => {
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

  return {
    activeTab,
    setActiveTab,
    pendingSpots,
    pendingLoading,
    rejectedSpots,
    rejectedLoading,
    approvedSpots,
    approvedLoading,
    handleApprove,
    handleReject,
    isSubmitting: mutation.isPending
  };
};
