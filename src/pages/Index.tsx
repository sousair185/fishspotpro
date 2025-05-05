
import { Suspense, useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Map from "../components/Map";
import { PopularSpots } from "@/components/spots/PopularSpots";
import { FishingSpot } from "@/types/spot";
import { NotificationBanner } from "@/components/notifications/NotificationBanner";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);

  useEffect(() => {
    // Simula um tempo de carregamento inicial
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => {
        setContentVisible(true);
      }, 300);
    }, 2000);
  }, []);

  const handleSpotSelect = (spot: FishingSpot) => {
    setSelectedSpot(spot);
    
    // Scroll to map to ensure it's visible
    const mapElement = document.getElementById('map-container');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-background pt-16">
      {/* Notification Banner */}
      <NotificationBanner />
      
      {/* Logo animado */}
      <div className={`fixed inset-0 flex items-center justify-center bg-background z-50 transition-all duration-500 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-center">
          <img 
            src="/lovable-uploads/29819dee-d106-4aa4-b4c7-8a52f509d5e8.png" 
            alt="FishSpot Pro Logo"
            className="w-32 h-32 animate-float"
          />
          <p className="mt-4 text-gradient font-bold text-xl animate-pulse">FishSpot Pro</p>
        </div>
      </div>

      {/* Logo fixo no topo - adjust position to account for notification banner */}
      <div className={`fixed top-16 left-4 z-30 transition-all duration-500 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/29819dee-d106-4aa4-b4c7-8a52f509d5e8.png" 
            alt="FishSpot Pro Logo"
            className="w-12 h-12 animate-float"
          />
          <span className="text-gradient font-bold">FishSpot Pro</span>
        </div>
      </div>

      <main className={`pb-20 transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
        <header className="p-6 animate-fade-in pt-12">
          <div className="flex items-center justify-end mb-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2 shadow-sm">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                  FishSpot Pro
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gradient">Encontre seu spot perfeito</h1>
              <p className="text-muted-foreground mt-1">Os melhores lugares para pesca em um só lugar</p>
            </div>
          </div>
        </header>

        <section className="px-6 animate-slide-up">
          <div id="map-container" className="aspect-auto w-full rounded-2xl glass-light glass-dark border-accent/20 shadow-lg md:h-[500px] h-[400px]">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <img 
                    src="/lovable-uploads/29819dee-d106-4aa4-b4c7-8a52f509d5e8.png" 
                    alt="FishSpot Pro Logo"
                    className="w-16 h-16 mx-auto mb-4 animate-pulse"
                  />
                  <p className="text-sm text-muted-foreground">Carregando mapa...</p>
                </div>
              </div>
            }>
              <Map selectedSpotFromList={selectedSpot} />
            </Suspense>
          </div>

          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-gradient">Pontos Populares</h2>
            <p className="text-muted-foreground mb-4">Descubra os spots mais visitados pela comunidade</p>
            <PopularSpots onSpotSelect={handleSpotSelect} />
          </div>
        </section>
      </main>
      <Navbar />
    </div>
  );
};

export default Index;
