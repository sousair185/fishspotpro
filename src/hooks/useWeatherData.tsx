
import { useState, useEffect, useRef } from 'react';
import { WeatherData } from '@/types/notification';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    pressure: 1013.25, // Default sea level pressure in hPa
    trend: 'stable',
    fishingCondition: 'Moderada',
    description: 'Condições estáveis de pesca'
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch weather data (simulated for now - would be replaced with actual API call)
  const fetchWeatherData = async () => {
    try {
      // Simulate pressure changes for demonstration
      const now = new Date();
      const hour = now.getHours();
      
      // Simulate pressure changes throughout the day
      const basePressure = 1013.25;
      const hourlyVariation = Math.sin((hour / 24) * 2 * Math.PI) * 3;
      const randomVariation = (Math.random() - 0.5) * 2; // Random variation between -1 and 1
      
      const currentPressure = basePressure + hourlyVariation + randomVariation;
      
      // Determine trend (simplified)
      let trend: 'rising' | 'falling' | 'stable';
      if (hourlyVariation > 0.5) trend = 'rising';
      else if (hourlyVariation < -0.5) trend = 'falling';
      else trend = 'stable';
      
      // Determine fishing conditions based on pressure and trend
      let fishingCondition = '';
      let description = '';
      
      if (currentPressure > 1018) {
        if (trend === 'rising') {
          fishingCondition = 'Boa a Excelente';
          description = 'Pressão alta e aumentando favorece a alimentação dos peixes';
        } else if (trend === 'falling') {
          fishingCondition = 'Muito Boa';
          description = 'Pressão alta começando a cair é ideal para a atividade dos peixes';
        } else {
          fishingCondition = 'Boa';
          description = 'Pressão alta estável geralmente mantém os peixes ativos';
        }
      } else if (currentPressure < 1008) {
        if (trend === 'rising') {
          fishingCondition = 'Melhorando';
          description = 'Pressão baixa subindo pode aumentar a atividade dos peixes';
        } else if (trend === 'falling') {
          fishingCondition = 'Ruim a Moderada';
          description = 'Pressão baixa e caindo reduz a atividade dos peixes';
        } else {
          fishingCondition = 'Moderada';
          description = 'Pressão baixa estável mantém os peixes menos ativos';
        }
      } else {
        if (trend === 'rising') {
          fishingCondition = 'Boa';
          description = 'Pressão normal subindo favorece a pesca';
        } else if (trend === 'falling') {
          fishingCondition = 'Moderada a Boa';
          description = 'Pressão normal caindo é favorável para muitas espécies';
        } else {
          fishingCondition = 'Moderada';
          description = 'Condições estáveis são geralmente previsíveis para pesca';
        }
      }
      
      setWeatherData({
        pressure: +currentPressure.toFixed(1),
        trend,
        fishingCondition,
        description
      });
      
    } catch (error) {
      console.error('Erro ao obter dados meteorológicos:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchWeatherData();
    
    // Set up interval for hourly updates
    intervalRef.current = setInterval(fetchWeatherData, 60 * 60 * 1000); // Hourly
    
    // Cleanup function
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { weatherData };
};
