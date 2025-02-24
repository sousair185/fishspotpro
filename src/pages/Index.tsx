
import { Suspense } from "react";
import { Map } from "lucide-react";
import Navbar from "../components/layout/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      <main className="pb-20">
        <header className="p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                FishSpot Pro
              </div>
              <h1 className="text-3xl font-bold text-foreground">Encontre seu spot perfeito</h1>
            </div>
          </div>
        </header>

        <section className="px-6 animate-slide-up">
          <div className="aspect-[4/3] w-full rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Mapa em desenvolvimento</p>
            </div>
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
