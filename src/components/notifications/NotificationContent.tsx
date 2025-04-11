
import React from 'react';
import { Notification } from '@/types/notification';

interface NotificationContentProps {
  notification: Notification;
  isExpanded: boolean;
}

export const NotificationContent = ({
  notification,
  isExpanded
}: NotificationContentProps) => {
  if (!isExpanded) {
    return null;
  }
  
  return (
    <div className="mt-2 text-sm pb-2">
      <p>{notification.message}</p>
      {notification.type !== 'moon' && notification.type !== 'weather' && (
        <p className="text-xs text-muted-foreground mt-1">
          Expira em: {new Date(notification.expiresAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};
