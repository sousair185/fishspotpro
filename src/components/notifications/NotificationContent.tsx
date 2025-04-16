
import React from 'react';
import { Notification } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface NotificationContentProps {
  notification: Notification;
  isExpanded: boolean;
  onAction?: () => void;
}

export const NotificationContent = ({
  notification,
  isExpanded,
  onAction
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
      
      <div className="mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAction}
          className="flex items-center gap-1"
        >
          <ExternalLink size={14} />
          <span>Abrir</span>
        </Button>
      </div>
    </div>
  );
};
