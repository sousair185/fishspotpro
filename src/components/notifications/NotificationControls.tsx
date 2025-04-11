
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationControlsProps {
  currentIndex: number;
  totalNotifications: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const NotificationControls = ({
  currentIndex,
  totalNotifications,
  onPrevious,
  onNext
}: NotificationControlsProps) => {
  if (totalNotifications <= 1) {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground">
        {currentIndex + 1}/{totalNotifications}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
