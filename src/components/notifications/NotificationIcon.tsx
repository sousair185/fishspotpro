
import React from 'react';
import { Bell, Moon, Thermometer } from 'lucide-react';
import { Notification } from '@/types/notification';

interface NotificationIconProps {
  type: Notification['type'];
}

export const NotificationIcon = ({ type }: NotificationIconProps) => {
  if (type === 'moon') {
    return <Moon className="h-5 w-5 text-blue-400" />;
  } else if (type === 'weather') {
    return <Thermometer className="h-5 w-5 text-orange-400" />;
  } else {
    return <Bell className="h-5 w-5 text-primary" />;
  }
};
