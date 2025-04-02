
import { useMoonPhase } from './useMoonPhase';
import { useWeatherData } from './useWeatherData';
import { useFirestoreNotifications } from './useFirestoreNotifications';
import { Notification } from '@/types/notification';

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

  // Combine all notification functions and data into one unified interface
  return {
    notifications,
    loading,
    moonPhase,
    weatherData,
    createNotification,
    deleteNotification,
    markAsRead,
    refreshNotifications
  };
};
