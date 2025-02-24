
import Navbar from "../components/layout/Navbar";
import { UserCircle } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      <main className="pb-20">
        <header className="p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Seu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações</p>
        </header>

        <section className="px-6">
          <div className="rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 p-8 text-center">
            <UserCircle className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
            <p className="text-muted-foreground">Perfil em desenvolvimento</p>
          </div>
        </section>
      </main>
      <Navbar />
    </div>
  );
};

export default Profile;
