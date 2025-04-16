
import React from 'react';
import { cn } from '@/lib/utils';
import { useNotificationBanner } from '@/hooks/useNotificationBanner';
import { NotificationIcon } from './NotificationIcon';
import { NotificationControls } from './NotificationControls';
import { NotificationActions } from './NotificationActions';
import { NotificationContent } from './NotificationContent';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationBanner = () => {
  const navigate = useNavigate();
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
  
  const handleNotificationClick = () => {
    // Only expand the notification to show details, don't navigate yet
    if (!isExpanded) {
      handleToggleExpand();
    }
  };
  
  const handleActionClick = () => {
    if (!currentNotification) return;
    
    // Mark the notification as read
    handleMarkAsRead(currentNotification.id);
    
    // Navigate to the appropriate page based on notification type
    switch (currentNotification.type) {
      case 'system':
        // For system notifications, we'll just close the banner
        handleClose();
        break;
      case 'admin':
        // Admin notifications typically relate to administrator tasks
        navigate('/admin');
        break;
      case 'moon':
        // Moon phase notifications relate to fishing conditions on the map
        navigate('/');
        break;
      case 'weather':
        // Weather notifications also relate to fishing conditions
        navigate('/');
        break;
      case 'message':
        // Message notifications lead to the messages page
        navigate('/messages');
        break;
      default:
        // Default behavior is to close the banner
        handleClose();
        break;
    }
    
    // Close the banner after navigation
    handleClose();
  };
  
  const notificationCount = allNotifications.length;
  
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
            <div className="flex items-center space-x-2 flex-1 cursor-pointer" onClick={handleNotificationClick}>
              <NotificationIcon type={currentNotification.type} />
              
              <div className="text-sm font-medium truncate">
                {currentNotification.title}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationControls 
                currentIndex={currentIndex}
                totalNotifications={allNotifications.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
              
              <div className="relative">
                <Bell 
                  size={20} 
                  className="text-primary cursor-pointer hover:text-primary/80 transition-colors" 
                  onClick={handleToggleExpand}
                />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-3 w-3 rounded-full bg-destructive"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive">
                      {notificationCount > 9 && (
                        <span className="text-[8px] font-bold text-white">+</span>
                      )}
                    </span>
                  </span>
                )}
              </div>
              
              <NotificationActions
                isExpanded={isExpanded}
                onToggleExpand={handleToggleExpand}
                onClose={handleClose}
              />
            </div>
          </div>
          
          <NotificationContent 
            notification={currentNotification}
            isExpanded={isExpanded}
            onAction={handleActionClick}
          />
        </div>
      </div>
    </>
  );
};
