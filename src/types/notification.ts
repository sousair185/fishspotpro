
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  createdBy: string;
  expiresAt: string; // When this notification will no longer be displayed
  type: 'system' | 'admin' | 'moon'; // Type of notification
  priority: 'high' | 'medium' | 'low'; // Display priority
  read?: boolean; // If the user has read this notification
}
