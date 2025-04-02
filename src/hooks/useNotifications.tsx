
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification, WeatherData } from '@/types/notification';
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
  const [weatherData, setWeatherData] = useState<WeatherData>({
    pressure: 1013.25, // Default sea level pressure in hPa
    trend: 'stable',
    fishingCondition: 'Moderada',
    description: 'Condições estáveis de pesca'
  });
  
  // Interval references for cleanup
  const intervalRefs = useRef<{
    moon: NodeJS.Timeout | null,
    weather: NodeJS.Timeout | null,
    notifications: NodeJS.Timeout | null
  }>({
    moon: null,
    weather: null,
    notifications: null
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

  // Fetch weather data (simulated for now - would be replaced with actual API call)
  const fetchWeatherData = async () => {
    try {
      // Simulate pressure changes for demonstration
      const now = new Date();
      const hour = now.getHours();
      
      // Simulate pressure changes throughout the day
      const basePressure = 1013.25;
      const hourlyVariation = Math.sin((hour / 24) * 2 * Math.PI) * 3;
      const randomVariation = (Math.random() - 0.5) * 2; // Random variation between -1 and 1
      
      const currentPressure = basePressure + hourlyVariation + randomVariation;
      
      // Determine trend (simplified)
      let trend: 'rising' | 'falling' | 'stable';
      if (hourlyVariation > 0.5) trend = 'rising';
      else if (hourlyVariation < -0.5) trend = 'falling';
      else trend = 'stable';
      
      // Determine fishing conditions based on pressure and trend
      let fishingCondition = '';
      let description = '';
      
      if (currentPressure > 1018) {
        if (trend === 'rising') {
          fishingCondition = 'Boa a Excelente';
          description = 'Pressão alta e aumentando favorece a alimentação dos peixes';
        } else if (trend === 'falling') {
          fishingCondition = 'Muito Boa';
          description = 'Pressão alta começando a cair é ideal para a atividade dos peixes';
        } else {
          fishingCondition = 'Boa';
          description = 'Pressão alta estável geralmente mantém os peixes ativos';
        }
      } else if (currentPressure < 1008) {
        if (trend === 'rising') {
          fishingCondition = 'Melhorando';
          description = 'Pressão baixa subindo pode aumentar a atividade dos peixes';
        } else if (trend === 'falling') {
          fishingCondition = 'Ruim a Moderada';
          description = 'Pressão baixa e caindo reduz a atividade dos peixes';
        } else {
          fishingCondition = 'Moderada';
          description = 'Pressão baixa estável mantém os peixes menos ativos';
        }
      } else {
        if (trend === 'rising') {
          fishingCondition = 'Boa';
          description = 'Pressão normal subindo favorece a pesca';
        } else if (trend === 'falling') {
          fishingCondition = 'Moderada a Boa';
          description = 'Pressão normal caindo é favorável para muitas espécies';
        } else {
          fishingCondition = 'Moderada';
          description = 'Condições estáveis são geralmente previsíveis para pesca';
        }
      }
      
      setWeatherData({
        pressure: +currentPressure.toFixed(1),
        trend,
        fishingCondition,
        description
      });
      
    } catch (error) {
      console.error('Erro ao obter dados meteorológicos:', error);
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
      
      // Create the query that gets notifications that haven't expired yet
      const q = query(
        notificationsRef,
        where('expiresAt', '>', now)
      );
      
      const snapshot = await getDocs(q);
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Sort the notifications after we've fetched them
      const sortedNotifications = notificationsList.sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        
        if (priorityA !== priorityB) {
          return priorityB - priorityA;
        }
        
        // Then sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setNotifications(sortedNotifications);
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
  const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'createdBy' | 'read'>) => {
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
        createdBy: user.uid,
        read: false // Make sure the read field is explicitly set to false
      };
      
      await addDoc(collection(db, 'notifications'), notificationData);
      
      toast({
        title: 'Sucesso',
        description: 'Notificação criada com sucesso'
      });
      
      await fetchNotifications();
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
      
      await fetchNotifications();
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
      
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  };

  useEffect(() => {
    // Initial fetches
    fetchMoonPhase();
    fetchWeatherData();
    fetchNotifications();
    
    // Set up intervals for periodic updates
    intervalRefs.current.moon = setInterval(fetchMoonPhase, 24 * 60 * 60 * 1000); // Daily
    intervalRefs.current.weather = setInterval(fetchWeatherData, 60 * 60 * 1000); // Hourly
    intervalRefs.current.notifications = setInterval(fetchNotifications, 5 * 60 * 1000); // Every 5 minutes
    
    // Cleanup function
    return () => {
      if (intervalRefs.current.moon) clearInterval(intervalRefs.current.moon);
      if (intervalRefs.current.weather) clearInterval(intervalRefs.current.weather);
      if (intervalRefs.current.notifications) clearInterval(intervalRefs.current.notifications);
    };
  }, [user]);

  return {
    notifications,
    loading,
    moonPhase,
    weatherData,
    createNotification,
    deleteNotification,
    markAsRead,
    refreshNotifications: fetchNotifications
  };
};
