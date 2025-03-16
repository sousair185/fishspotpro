
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { FishingSpot } from "@/types/spot";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotLoggedInView } from "@/components/spots/NotLoggedInView";
import { MySpotsTab } from "@/components/spots/MySpotsTab";
import { LikedSpotsTab } from "@/components/spots/LikedSpotsTab";
import { useSpots } from "@/hooks/useSpots";

const Spots = () => {
  const { user, isVip } = useAuth();
  const navigate = useNavigate();

  // Fetch spots data using custom hook
  const { 
    userSpots, 
    likedSpots, 
    isLoadingUserSpots, 
    isLoadingLikedSpots 
  } = useSpots(user);

  // Function to navigate to the map and center on a spot
  const navigateToSpot = (spot: FishingSpot) => {
    // Add a clean URL with proper parameters to ensure proper centering
    navigate(`/?lat=${spot.coordinates[1]}&lng=${spot.coordinates[0]}&spotId=${spot.id}`);
  };

  if (!user) {
    return (
      <>
        <NotLoggedInView />
        <Navbar />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      <main className="pb-20">
        <header className="p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pontos de Pesca</h1>
          <p className="text-muted-foreground">Gerencie seus pontos cadastrados e pontos favoritos</p>
        </header>

        <Tabs defaultValue="myspots" className="w-full px-6">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="myspots">Meus Spots</TabsTrigger>
            <TabsTrigger value="liked">Spots Curtidos</TabsTrigger>
          </TabsList>
          
          {/* Aba de spots do usuário */}
          <TabsContent value="myspots">
            <MySpotsTab 
              spots={userSpots} 
              isLoading={isLoadingUserSpots} 
              isVip={isVip} 
              onSpotClick={navigateToSpot} 
            />
          </TabsContent>
          
          {/* Aba de spots curtidos */}
          <TabsContent value="liked">
            <LikedSpotsTab 
              spots={likedSpots} 
              isLoading={isLoadingLikedSpots} 
              onSpotClick={navigateToSpot} 
            />
          </TabsContent>
        </Tabs>
      </main>
      <Navbar />
    </div>
  );
};

export default Spots;
