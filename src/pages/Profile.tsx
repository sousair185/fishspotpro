
import { Button } from "@/components/ui/button";
import Navbar from "../components/layout/Navbar";
import { UserCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Profile = () => {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      <main className="pb-20">
        <header className="p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Seu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações</p>
        </header>

        <section className="px-6">
          <div className="rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 p-8">
            {user ? (
              <div className="text-center">
                <UserCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2">{user.email}</h2>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={logout}
                >
                  Sair da conta
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <UserCircle className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
                <p className="text-muted-foreground mb-4">Faça login para acessar seu perfil</p>
                <Button 
                  variant="default"
                  onClick={signInWithGoogle}
                >
                  Entrar com Google
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Navbar />
    </div>
  );
};

export default Profile;
