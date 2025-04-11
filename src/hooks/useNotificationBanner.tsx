
import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';

export const useNotificationBanner = () => {
  const { notifications, moonPhase, weatherData, markAsRead } = useNotifications();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Filter out already read notifications
  const unreadNotifications = notifications.filter(n => !n.read);
  
  // Combine moon notification, weather notification, and admin notifications
  const allNotifications: Notification[] = [
    {
      id: 'moon-phase',
      title: moonPhase.phase,
      message: moonPhase.influence,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      type: 'moon',
      priority: 'medium',
      createdBy: 'system'
    },
    {
      id: 'weather-data',
      title: `Pressão: ${weatherData.pressure} hPa (${weatherData.trend === 'rising' ? '↑' : weatherData.trend === 'falling' ? '↓' : '→'})`,
      message: `Condição de pesca: ${weatherData.fishingCondition}. ${weatherData.description}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      type: 'weather',
      priority: 'medium',
      createdBy: 'system'
    },
    ...unreadNotifications
  ];
  
  const handleMarkAsRead = (notificationId: string) => {
    if (notificationId !== 'moon-phase' && notificationId !== 'weather-data') {
      markAsRead(notificationId);
    }
  };
  
  const handlePrevious = () => {
    setCurrentIndex(prev => 
      prev === 0 ? allNotifications.length - 1 : prev - 1
    );
    resetRotationTimer();
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => 
      prev === allNotifications.length - 1 ? 0 : prev + 1
    );
    resetRotationTimer();
  };
  
  const handleClose = () => {
    setIsVisible(false);
    if (currentNotification) {
      handleMarkAsRead(currentNotification.id);
    }
  };
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && currentNotification) {
      handleMarkAsRead(currentNotification.id);
    }
  };
  
  // Set up rotation between notifications
  useEffect(() => {
    const startRotation = () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
      
      rotationIntervalRef.current = setInterval(() => {
        if (!isPaused && allNotifications.length > 1) {
          setRotationIndex(prev => (prev + 1) % allNotifications.length);
          setCurrentIndex(prev => (prev + 1) % allNotifications.length);
        }
      }, 8000); // Rotate every 8 seconds
    };
    
    startRotation();
    
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, [isPaused, allNotifications.length]);
  
  const resetRotationTimer = () => {
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      
      rotationIntervalRef.current = setInterval(() => {
        if (!isPaused && allNotifications.length > 1) {
          setRotationIndex(prev => (prev + 1) % allNotifications.length);
          setCurrentIndex(prev => (prev + 1) % allNotifications.length);
        }
      }, 8000); // Rotate every 8 seconds
    }
  };
  
  const currentNotification = allNotifications.length > 0 ? allNotifications[currentIndex] : null;
  
  return {
    currentNotification,
    allNotifications,
    currentIndex,
    isExpanded,
    isVisible,
    isPaused,
    setIsPaused,
    handleMarkAsRead,
    handlePrevious,
    handleNext,
    handleClose,
    handleToggleExpand,
    setIsExpanded
  };
};
