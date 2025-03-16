
import React from "react";

export const NotLoggedInView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      <main className="pb-20">
        <header className="p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pontos de Pesca</h1>
          <p className="text-muted-foreground">Faça login para visualizar seus spots</p>
        </header>
      </main>
    </div>
  );
};
