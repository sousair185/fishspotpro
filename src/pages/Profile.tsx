
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "../components/layout/Navbar";
import { UserCircle, Shield, Crown } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { isUserAdmin, promoteToAdmin, promoteToVip } from "../lib/firebase";
import { useToast } from "../hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

const Profile = () => {
  const { user, signInWithGoogle, logout, isVip } = useAuth();
  const { toast } = useToast();
  const [targetUid, setTargetUid] = useState("");
  const [vipDuration, setVipDuration] = useState("30");
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotingVip, setPromotingVip] = useState(false);

  // Verificar se o usuário atual é administrador
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['isAdmin', user?.uid],
    queryFn: async () => {
      if (!user) return false;
      return isUserAdmin(user.uid);
    },
    enabled: !!user
  });

  const handlePromoteUser = async () => {
    if (!user || !targetUid.trim()) return;
    
    setIsPromoting(true);
    try {
      const success = await promoteToAdmin(user.uid, targetUid.trim());
      
      if (success) {
        toast({
          title: "Usuário promovido com sucesso",
          description: "O usuário agora tem acesso de administrador",
        });
        setTargetUid("");
      } else {
        toast({
          title: "Falha ao promover usuário",
          description: "Você não tem permissão ou ocorreu um erro",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao promover o usuário",
        variant: "destructive"
      });
    } finally {
      setIsPromoting(false);
    }
  };

  const handlePromoteToVip = async () => {
    if (!user || !targetUid.trim()) return;
    
    setPromotingVip(true);
    try {
      const days = parseInt(vipDuration) || 30; // Padrão de 30 dias se inválido
      const success = await promoteToVip(user.uid, targetUid.trim(), days);
      
      if (success) {
        toast({
          title: "Usuário promovido a VIP",
          description: `O usuário agora tem status VIP por ${days} dias`,
        });
        setTargetUid("");
        setVipDuration("30");
      } else {
        toast({
          title: "Falha ao promover usuário a VIP",
          description: "Você não tem permissão ou ocorreu um erro",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao promover o usuário a VIP",
        variant: "destructive"
      });
    } finally {
      setPromotingVip(false);
    }
  };

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
                <div className="relative inline-block">
                  <UserCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
                  {isAdmin && (
                    <Shield className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
                  )}
                  {isVip && !isAdmin && (
                    <Crown className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">{user.email}</h2>
                {isCheckingAdmin ? (
                  <p className="text-sm text-muted-foreground mb-4">Verificando permissões...</p>
                ) : isAdmin ? (
                  <p className="text-sm text-yellow-600 font-medium mb-4">
                    Usuário Administrador
                  </p>
                ) : isVip ? (
                  <p className="text-sm text-yellow-600 font-medium mb-4">
                    Usuário VIP
                  </p>
                ) : null}
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

          {/* Seção de promoção de usuários - visível apenas para administradores */}
          {user && isAdmin && (
            <div className="space-y-6 mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Promoção de Administradores</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetUid">UID do usuário a ser promovido</Label>
                      <Input
                        id="targetUid"
                        value={targetUid}
                        onChange={(e) => setTargetUid(e.target.value)}
                        placeholder="Digite o UID do usuário"
                      />
                    </div>
                    <Button 
                      onClick={handlePromoteUser} 
                      disabled={isPromoting || !targetUid.trim()}
                      className="w-full"
                    >
                      {isPromoting ? "Promovendo..." : "Promover a Administrador"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Promoção de Usuários VIP</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vipTargetUid">UID do usuário a ser promovido a VIP</Label>
                      <Input
                        id="vipTargetUid"
                        value={targetUid}
                        onChange={(e) => setTargetUid(e.target.value)}
                        placeholder="Digite o UID do usuário"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vipDuration">Duração do VIP (em dias)</Label>
                      <Input
                        id="vipDuration"
                        type="number"
                        min="1"
                        value={vipDuration}
                        onChange={(e) => setVipDuration(e.target.value)}
                        placeholder="30"
                      />
                    </div>
                    <Button 
                      onClick={handlePromoteToVip} 
                      disabled={promotingVip || !targetUid.trim()}
                      className="w-full"
                    >
                      {promotingVip ? "Promovendo..." : "Promover a VIP"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </main>
      <Navbar />
    </div>
  );
};

export default Profile;
