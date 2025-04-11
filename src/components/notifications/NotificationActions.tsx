
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationActionsProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export const NotificationActions = ({
  isExpanded,
  onToggleExpand,
  onClose
}: NotificationActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={onToggleExpand}
      >
        {isExpanded ? 'Fechar' : 'Detalhes'}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
