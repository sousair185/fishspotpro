
import React from 'react';
import { cn } from '@/lib/utils';
import { useNotificationBanner } from '@/hooks/useNotificationBanner';
import { NotificationIcon } from './NotificationIcon';
import { NotificationControls } from './NotificationControls';
import { NotificationActions } from './NotificationActions';
import { NotificationContent } from './NotificationContent';

export const NotificationBanner = () => {
  const {
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
    handleToggleExpand
  } = useNotificationBanner();
  
  // If no notifications or banner is closed, don't render anything
  if (!currentNotification || !isVisible) {
    return null;
  }
  
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
              <NotificationIcon type={currentNotification.type} />
              
              <div className="text-sm font-medium truncate">
                {currentNotification.title}
              </div>
              
              <NotificationControls 
                currentIndex={currentIndex}
                totalNotifications={allNotifications.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </div>
            
            <NotificationActions
              isExpanded={isExpanded}
              onToggleExpand={handleToggleExpand}
              onClose={handleClose}
            />
          </div>
          
          <NotificationContent 
            notification={currentNotification}
            isExpanded={isExpanded}
          />
        </div>
      </div>
    </>
  );
};
