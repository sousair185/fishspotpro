
import React from 'react';
import Navbar from "../components/layout/Navbar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Rocket } from 'lucide-react';
import { NotificationManager } from '@/components/admin/NotificationManager';
import { BoostManager } from '@/components/admin/BoostManager';
import { NotificationBanner } from '@/components/notifications/NotificationBanner';
import { useSpotManagement } from '@/hooks/useSpotManagement';
import SpotsTabContent from '@/components/admin/SpotsTabContent';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  
  const {
    activeTab,
    setActiveTab,
    pendingSpots,
    pendingLoading,
    rejectedSpots,
    rejectedLoading,
    approvedSpots,
    approvedLoading,
    handleApprove,
    handleReject,
    isSubmitting
  } = useSpotManagement(user, isAdmin);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
        <main className="pb-20 px-6">
          <header className="p-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Administração</h1>
            <p className="text-muted-foreground">Faça login para acessar esta página</p>
          </header>
        </main>
        <Navbar />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
        <main className="pb-20 px-6">
          <header className="p-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Acesso Restrito</h1>
            <p className="text-muted-foreground">Esta página é apenas para administradores.</p>
          </header>
        </main>
        <Navbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Notification Banner */}
      <NotificationBanner />
      
      <main className="pb-20 px-6 pt-16">
        <header className="p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Administração</h1>
          <p className="text-muted-foreground">Gerencie spots, notificações e destaques do sistema</p>
        </header>

        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="pending" className="relative">
              Spots Pendentes
              {pendingSpots && pendingSpots.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {pendingSpots.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Spots Aprovados</TabsTrigger>
            <TabsTrigger value="rejected">Spots Rejeitados</TabsTrigger>
            <TabsTrigger value="notifications">
              <span className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                Notif.
              </span>
            </TabsTrigger>
            <TabsTrigger value="boosts">
              <span className="flex items-center gap-1">
                <Rocket className="h-4 w-4" />
                Destaques
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            <SpotsTabContent
              spots={pendingSpots}
              isLoading={pendingLoading}
              activeTab={activeTab}
              onApprove={handleApprove}
              onReject={handleReject}
              isPending={isSubmitting}
            />
          </TabsContent>
          
          <TabsContent value="approved" className="mt-4">
            <SpotsTabContent
              spots={approvedSpots}
              isLoading={approvedLoading}
              activeTab={activeTab}
              onApprove={handleApprove}
              onReject={handleReject}
              isPending={isSubmitting}
            />
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-4">
            <SpotsTabContent
              spots={rejectedSpots}
              isLoading={rejectedLoading}
              activeTab={activeTab}
              onApprove={handleApprove}
              onReject={handleReject}
              isPending={isSubmitting}
            />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-4">
            <NotificationManager />
          </TabsContent>
          
          <TabsContent value="boosts" className="mt-4">
            <BoostManager />
          </TabsContent>
        </Tabs>
      </main>
      <Navbar />
    </div>
  );
};

export default Admin;
