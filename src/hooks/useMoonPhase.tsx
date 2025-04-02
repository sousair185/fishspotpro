
import { useState, useEffect, useRef } from 'react';

interface MoonPhaseInfo {
  phase: string;
  influence: string;
}

export const useMoonPhase = () => {
  const [moonPhase, setMoonPhase] = useState<MoonPhaseInfo>({ 
    phase: '', 
    influence: '' 
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch moon phase information
  const fetchMoonPhase = async () => {
    try {
      // Calculate current moon phase
      // This is a simplified calculation that doesn't account for all nuances
      const date = new Date();
      const synodic = 29.53; // Moon cycle in days
      
      // Days since new moon on Jan 6, 2000
      const refDate = new Date(2000, 0, 6);
      const daysSince = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
      const normalizedDays = daysSince % synodic;
      
      // Map to moon phase
      let phase = '';
      let influence = '';
      
      if (normalizedDays < 1) {
        phase = 'Lua Nova';
        influence = 'Atividade moderada, melhor durante o dia';
      } else if (normalizedDays < 7.4) {
        phase = 'Lua Crescente';
        influence = 'Atividade aumentando, bom para pesca noturna';
      } else if (normalizedDays < 8.4) {
        phase = 'Quarto Crescente';
        influence = 'Atividade boa, período de alimentação ativa';
      } else if (normalizedDays < 14.8) {
        phase = 'Lua Gibosa Crescente';
        influence = 'Excelente para pesca, peixes mais ativos';
      } else if (normalizedDays < 15.8) {
        phase = 'Lua Cheia';
        influence = 'Período ótimo para pesca, especialmente à noite';
      } else if (normalizedDays < 22.1) {
        phase = 'Lua Gibosa Minguante';
        influence = 'Boa atividade, diminuindo gradualmente';
      } else if (normalizedDays < 23.1) {
        phase = 'Quarto Minguante';
        influence = 'Atividade moderada, melhor de manhã cedo';
      } else {
        phase = 'Lua Minguante';
        influence = 'Atividade baixa a moderada';
      }
      
      setMoonPhase({ phase, influence });
    } catch (error) {
      console.error('Erro ao obter fase da lua:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMoonPhase();
    
    // Set up interval for daily updates
    intervalRef.current = setInterval(fetchMoonPhase, 24 * 60 * 60 * 1000); // Daily
    
    // Cleanup function
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { moonPhase };
};
