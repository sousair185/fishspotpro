
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Moon, Thermometer, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const NotificationBanner = () => {
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
  
  // If no notifications or banner is closed, don't render anything
  if (allNotifications.length === 0 || !isVisible) {
    return null;
  }
  
  const currentNotification = allNotifications[currentIndex];
  
  return (
    <>
      {/* This is an empty div that takes up the same space as the notification banner */}
      <div 
        className={cn(
          "h-12 w-full",
          isExpanded && "h-auto min-h-[100px]"
        )}
      />
      
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-b z-40 transition-all duration-300 shadow-md",
          isExpanded ? "h-auto" : "h-12"
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              {currentNotification.type === 'moon' ? (
                <Moon className="h-5 w-5 text-blue-400" />
              ) : currentNotification.type === 'weather' ? (
                <Thermometer className="h-5 w-5 text-orange-400" />
              ) : (
                <Bell className="h-5 w-5 text-primary" />
              )}
              
              <div className="text-sm font-medium truncate">
                {currentNotification.title}
              </div>
              
              {allNotifications.length > 1 && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {currentIndex + 1}/{allNotifications.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setIsExpanded(!isExpanded);
                  if (!isExpanded) {
                    handleMarkAsRead(currentNotification.id);
                  }
                }}
              >
                {isExpanded ? 'Fechar' : 'Detalhes'}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-2 text-sm pb-2">
              <p>{currentNotification.message}</p>
              {currentNotification.type !== 'moon' && currentNotification.type !== 'weather' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Expira em: {new Date(currentNotification.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
