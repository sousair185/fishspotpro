
import { Suspense, useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Map from "../components/Map";
import { PopularSpots } from "@/components/spots/PopularSpots";
import { FishingSpot } from "@/types/spot";
import { NotificationBanner } from "@/components/notifications/NotificationBanner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
    <div className="min-h-screen bg-gradient-soft pt-16">
      {/* Notification Banner */}
      <NotificationBanner />
      
      {/* Logo animado - Splash Screen */}
      <div className={`fixed inset-0 flex items-center justify-center bg-gradient-vibrant z-50 transition-all duration-700 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/30 shadow-elevation">
          <img 
            src="/lovable-uploads/29819dee-d106-4aa4-b4c7-8a52f509d5e8.png" 
            alt="FishSpot Pro Logo"
            className="w-32 h-32 animate-float"
          />
          <p className="mt-6 text-gradient font-display font-bold text-2xl animate-pulse">FishSpot Pro</p>
          <div className="mt-4 flex items-center gap-2 justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse delay-75"></div>
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse delay-150"></div>
          </div>
        </div>
      </div>

      {/* Logo e Theme Toggle no topo */}
      <div className={`fixed top-16 left-0 right-0 z-30 px-4 py-2 transition-all duration-500 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/29819dee-d106-4aa4-b4c7-8a52f509d5e8.png" 
              alt="FishSpot Pro Logo"
              className="w-12 h-12 animate-float"
            />
            <span className="text-gradient font-bold font-display">FishSpot Pro</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <main className={`pb-24 transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="content-container">
          <header className="p-6 animate-fade-in pt-24 md:pt-28">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2 shadow-sm">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                    <span className="font-display">FishSpot Pro</span>
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient">Encontre seu spot perfeito</h1>
                <p className="text-muted-foreground mt-1 max-w-lg">Os melhores lugares para pesca em um só lugar. Descubra, compartilhe e conecte-se com pescadores de todo o Brasil.</p>
              </div>
              
              <div className="flex gap-2">
                <div className="hidden md:block">
                  {/* Additional controls could go here */}
                </div>
              </div>
            </div>
          </header>

          <section className="px-6 animate-slide-up">
            <div id="map-container" className="aspect-auto w-full rounded-2xl glass-light glass-dark border-accent/20 shadow-card md:h-[500px] h-[400px] overflow-hidden">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-card/50 backdrop-blur-sm">
                  <div className="text-center p-6 rounded-xl bg-background/50 shadow-soft border border-border/30">
                    <img 
                      src="/lovable-uploads/29819dee-d106-4aa4-b4c7-8a52f509d5e8.png" 
                      alt="FishSpot Pro Logo"
                      className="w-16 h-16 mx-auto mb-4 animate-pulse"
                    />
                    <p className="text-sm text-muted-foreground">Carregando mapa...</p>
                    <div className="mt-4 flex items-center gap-2 justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-bounce delay-75"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              }>
                <Map selectedSpotFromList={selectedSpot} />
              </Suspense>
            </div>

            <div className="mt-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gradient mb-2">Pontos Populares</h2>
                  <p className="text-muted-foreground">Descubra os spots mais visitados pela comunidade</p>
                </div>
                
                <div className="hidden md:flex items-center space-x-2">
                  {/* Future filter or action buttons could go here */}
                </div>
              </div>
              
              <div className="mt-6">
                <PopularSpots onSpotSelect={handleSpotSelect} />
              </div>
            </div>
          </section>
        </div>
      </main>
      <Navbar />
    </div>
  );
};

export default Index;
