
import { Link } from "react-router-dom";
import { Map, Fish, UserCircle, Settings, Users, MessageSquare, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Navbar = () => {
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50 px-3 py-2 z-50 dark:bg-card/50 dark:border-border/30 glass-dark glass-light">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          <NavLink to="/" icon={<Map size={22} className="text-blue-500" />} label="Mapa" />
          <NavLink to="/spots" icon={<Fish size={22} className="text-emerald-500" />} label="Pontos" />
          <NavLink 
            to="/social" 
            icon={<Users size={22} className="text-violet-500" />} 
            label="Social" 
          />
          <NavLink 
            to="/messages" 
            icon={<MessageSquare size={22} className="text-amber-500" />} 
            label="Mensagens" 
          />
          <NavLink 
            to="/search" 
            icon={<Search size={22} className="text-cyan-500" />} 
            label="Buscar" 
          />
          {isAdmin && (
            <NavLink to="/admin" icon={<Settings size={22} className="text-rose-500" />} label="Admin" />
          )}
          <NavLink to="/profile" icon={<UserCircle size={22} className="text-indigo-500" />} label="Perfil" />
          
          {!isMobile && <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <ThemeToggle />
          </div>}
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
    className="flex flex-col items-center gap-1 p-1.5 text-muted-foreground hover:text-primary transition-colors duration-200 relative"
    onClick={onClick}
  >
    <div className="relative">
      {icon}
      {notificationCount && notificationCount > 0 && (
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
    <span className="text-[10px] font-medium">{label}</span>
  </Link>
);

export default Navbar;
