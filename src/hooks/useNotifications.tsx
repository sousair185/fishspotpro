
import { useMoonPhase } from './useMoonPhase';
import { useWeatherData } from './useWeatherData';
import { useFirestoreNotifications } from './useFirestoreNotifications';
import { Notification } from '@/types/notification';
import { useMessages } from './useMessages';
import { useEffect, useState } from 'react';

export const useNotifications = () => {
  const { moonPhase } = useMoonPhase();
  const { weatherData } = useWeatherData();
  const { 
    notifications, 
    loading, 
    createNotification, 
    deleteNotification, 
    markAsRead, 
    refreshNotifications 
  } = useFirestoreNotifications();
  const { inboxMessages } = useMessages();
  const [messageNotifications, setMessageNotifications] = useState<Notification[]>([]);
  
  // Create message notifications based on unread messages
  useEffect(() => {
    const unreadMessages = inboxMessages.filter(msg => !msg.read);
    
    // Create notification objects for unread messages
    const newMessageNotifications = unreadMessages.map(msg => ({
      id: `message-${msg.id}`,
      title: `Nova mensagem de ${msg.senderName || 'Usuário'}`,
      message: msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content,
      createdAt: msg.createdAt,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      type: 'message' as 'system' | 'admin' | 'moon' | 'weather' | 'message',
      priority: 'high' as 'high' | 'medium' | 'low',
      createdBy: msg.senderId,
      read: false
    }));
    
    setMessageNotifications(newMessageNotifications);
  }, [inboxMessages]);
  
  // Combine all notification functions and data into one unified interface
  return {
    notifications: [...notifications, ...messageNotifications],
    loading,
    moonPhase,
    weatherData,
    createNotification,
    deleteNotification,
    markAsRead,
    refreshNotifications
  };
};
