
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  createdBy: string;
  expiresAt: string; // When this notification will no longer be displayed
  type: 'system' | 'admin' | 'moon' | 'weather' | 'message'; // Type of notification
  priority: 'high' | 'medium' | 'low'; // Display priority
  read?: boolean; // If the user has read this notification
  targetId?: string; // Optional target ID (e.g., message ID) for navigating to specific content
}

export interface WeatherData {
  pressure: number;
  trend: 'rising' | 'falling' | 'stable';
  fishingCondition: string;
  description: string;
}
