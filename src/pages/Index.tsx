
import { Suspense, useState, useEffect } from "react";
import { Map as MapIcon } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Map from "../components/Map";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Simula um tempo de carregamento inicial
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => {
        setContentVisible(true);
      }, 300);
    }, 2000);
  }, []);

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

      {/* Logo fixo no topo */}
      <div className={`fixed top-4 left-4 z-40 transition-all duration-500 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <img 
          src="/lovable-uploads/29819dee-d106-4aa4-b4c7-8a52f509d5e8.png" 
          alt="FishSpot Pro Logo"
          className="w-12 h-12"
        />
      </div>

      <main className={`pb-20 transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
        <header className="p-6 animate-fade-in">
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
          <div className="aspect-[4/3] w-full rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg">
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
              <Map />
            </Suspense>
          </div>

          <div className="mt-8 space-y-4">
            <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50">
              <h3 className="text-lg font-semibold mb-2">Spots Populares</h3>
              <p className="text-sm text-muted-foreground">
                Em breve você poderá descobrir os melhores pontos de pesca.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Navbar />
    </div>
  );
};

export default Index;
