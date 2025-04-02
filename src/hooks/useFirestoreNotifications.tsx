
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification } from '@/types/notification';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useFirestoreNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    // Initial fetch
    if (user) {
      fetchNotifications();
      
      // Set up interval for periodic updates
      intervalRef.current = setInterval(fetchNotifications, 5 * 60 * 1000); // Every 5 minutes
    }
    
    // Cleanup function
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  return {
    notifications,
    loading,
    createNotification,
    deleteNotification,
    markAsRead,
    refreshNotifications: fetchNotifications
  };
};
