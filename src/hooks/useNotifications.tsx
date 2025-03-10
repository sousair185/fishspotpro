
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification } from '@/types/notification';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [moonPhase, setMoonPhase] = useState<{ phase: string; influence: string }>({ 
    phase: '', 
    influence: '' 
  });

  // Fetch moon phase information
  const fetchMoonPhase = async () => {
    try {
      // Calculate current moon phase
      // This is a simplified calculation that doesn't account for all nuances
      const date = new Date();
      const synodic = 29.53; // Moon cycle in days
      
      // Days since new moon on Jan 6, 2000
      const refDate = new Date(2000, 0, 6);
      const daysSince = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
      const normalizedDays = daysSince % synodic;
      
      // Map to moon phase
      let phase = '';
      let influence = '';
      
      if (normalizedDays < 1) {
        phase = 'Lua Nova';
        influence = 'Atividade moderada, melhor durante o dia';
      } else if (normalizedDays < 7.4) {
        phase = 'Lua Crescente';
        influence = 'Atividade aumentando, bom para pesca noturna';
      } else if (normalizedDays < 8.4) {
        phase = 'Quarto Crescente';
        influence = 'Atividade boa, período de alimentação ativa';
      } else if (normalizedDays < 14.8) {
        phase = 'Lua Gibosa Crescente';
        influence = 'Excelente para pesca, peixes mais ativos';
      } else if (normalizedDays < 15.8) {
        phase = 'Lua Cheia';
        influence = 'Período ótimo para pesca, especialmente à noite';
      } else if (normalizedDays < 22.1) {
        phase = 'Lua Gibosa Minguante';
        influence = 'Boa atividade, diminuindo gradualmente';
      } else if (normalizedDays < 23.1) {
        phase = 'Quarto Minguante';
        influence = 'Atividade moderada, melhor de manhã cedo';
      } else {
        phase = 'Lua Minguante';
        influence = 'Atividade baixa a moderada';
      }
      
      setMoonPhase({ phase, influence });
    } catch (error) {
      console.error('Erro ao obter fase da lua:', error);
    }
  };

  // Fetch notifications from Firestore
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get current timestamp
      const now = new Date().toISOString();
      
      // Query notifications that haven't expired yet
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('expiresAt', '>', now),
        orderBy('expiresAt', 'desc'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as notificações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new notification (admin only)
  const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user || !isAdmin) {
      toast({
        title: 'Erro',
        description: 'Você não tem permissão para criar notificações',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      const notificationData = {
        ...notification,
        createdAt: new Date().toISOString(),
        createdBy: user.uid
      };
      
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      
      toast({
        title: 'Sucesso',
        description: 'Notificação criada com sucesso'
      });
      
      fetchNotifications();
      return true;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a notificação',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Delete a notification (admin only)
  const deleteNotification = async (notificationId: string) => {
    if (!user || !isAdmin) {
      toast({
        title: 'Erro',
        description: 'Você não tem permissão para excluir notificações',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      
      toast({
        title: 'Sucesso',
        description: 'Notificação excluída com sucesso'
      });
      
      fetchNotifications();
      return true;
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a notificação',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return false;
    
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      
      fetchNotifications();
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchMoonPhase();
    fetchNotifications();
    
    // Refresh moon phase daily
    const moonInterval = setInterval(fetchMoonPhase, 24 * 60 * 60 * 1000);
    
    // Refresh notifications every 5 minutes to check for expired ones
    const notificationsInterval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => {
      clearInterval(moonInterval);
      clearInterval(notificationsInterval);
    };
  }, [user]);

  return {
    notifications,
    loading,
    moonPhase,
    createNotification,
    deleteNotification,
    markAsRead,
    refreshNotifications: fetchNotifications
  };
};
