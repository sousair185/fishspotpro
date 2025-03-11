
import { Suspense, useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Map from "../components/Map";
import { PopularSpots } from "@/components/spots/PopularSpots";
import { FishingSpot } from "@/types/spot";

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
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Logo animado */}
      <div className={`fixed inset-0 flex items-center justify-center bg-background z-50 transition-all duration-500 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <img 
          src="/lovable-uploads/29819dee-d106-4aa4-b4c7-8a52f509d5e8.png" 
          alt="FishSpot Pro Logo"
          className="w-32 h-32 animate-pulse"
        />
      </div>

      {/* Logo fixo no topo - adjust position to account for notification banner */}
      <div className={`fixed top-16 left-4 z-30 transition-all duration-500 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <img 
          src="/lovable-uploads/29819dee-d106-4aa4-b4c7-8a52f509d5e8.png" 
          alt="FishSpot Pro Logo"
          className="w-12 h-12"
        />
      </div>

      <main className={`pb-20 transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
        <header className="p-6 animate-fade-in pt-12">
          <div className="flex items-center justify-end mb-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                FishSpot Pro
              </div>
              <h1 className="text-3xl font-bold text-foreground">Encontre seu spot perfeito</h1>
            </div>
          </div>
        </header>

        <section className="px-6 animate-slide-up">
          <div id="map-container" className="aspect-auto w-full rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg md:h-[500px] h-[400px]">
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
            <PopularSpots onSpotSelect={handleSpotSelect} />
          </div>
        </section>
      </main>
      <Navbar />
    </div>
  );
};

export default Index;
