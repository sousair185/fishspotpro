
import { Link } from "react-router-dom";
import { Map, Fish, UserCircle } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50 px-6 py-2 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          <NavLink to="/" icon={<Map size={24} />} label="Mapa" />
          <NavLink to="/spots" icon={<Fish size={24} />} label="Pontos" />
          <NavLink to="/profile" icon={<UserCircle size={24} />} label="Perfil" />
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors duration-200"
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </Link>
);

export default Navbar;
