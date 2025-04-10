
import { Link } from "react-router-dom";
import { Map, Fish, UserCircle, Settings, Users, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const { isAdmin } = useAuth();
  const { unreadCount } = useMessages();
  const { notifications, markAsRead } = useNotifications();
  
  // Filter unread notifications
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  // Handle tab click to reset notification counter
  const handleNotificationTabClick = () => {
    // Mark all notifications as read when clicking on the social tab
    if (unreadNotifications > 0) {
      notifications
        .filter(n => !n.read)
        .forEach(notification => {
          if (notification.id !== 'moon-phase' && notification.id !== 'weather-data') {
            markAsRead(notification.id);
          }
        });
    }
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50 px-6 py-2 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          <NavLink to="/" icon={<Map size={24} />} label="Mapa" />
          <NavLink to="/spots" icon={<Fish size={24} />} label="Pontos" />
          <NavLink 
            to="/social" 
            icon={<Users size={24} />} 
            label="Social" 
            notificationCount={unreadNotifications}
            onClick={handleNotificationTabClick}
          />
          <NavLink 
            to="/messages" 
            icon={<MessageSquare size={24} />} 
            label="Mensagens" 
            notificationCount={unreadCount}
          />
          {isAdmin && (
            <NavLink to="/admin" icon={<Settings size={24} />} label="Gerenciar" />
          )}
          <NavLink to="/profile" icon={<UserCircle size={24} />} label="Perfil" />
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  notificationCount?: number;
  onClick?: () => void;
}

const NavLink = ({ to, icon, label, notificationCount, onClick }: NavLinkProps) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors duration-200 relative"
    onClick={onClick}
  >
    <div className="relative">
      {icon}
      {notificationCount && notificationCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
        >
          {notificationCount > 9 ? '9+' : notificationCount}
        </Badge>
      )}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </Link>
);

export default Navbar;
