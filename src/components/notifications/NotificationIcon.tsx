
import React from 'react';
import { Bell, Moon, Thermometer, MessageSquare } from 'lucide-react';
import { Notification } from '@/types/notification';

interface NotificationIconProps {
  type: Notification['type'];
}

export const NotificationIcon = ({ type }: NotificationIconProps) => {
  if (type === 'moon') {
    return <Moon className="h-5 w-5 text-indigo-400 animate-pulse" />;
  } else if (type === 'weather') {
    return <Thermometer className="h-5 w-5 text-orange-400" />;
  } else if (type === 'message') {
    return <MessageSquare className="h-5 w-5 text-amber-500" />;
  } else {
    return <Bell className="h-5 w-5 text-primary animate-pulse" />;
  }
};
