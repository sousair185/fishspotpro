
// Storage key for user location
const USER_LOCATION_KEY = 'lastUserLocation';

// Helper functions to store and retrieve location from localStorage
export const saveUserLocation = (location: { lat: number; lng: number }) => {
  try {
    localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
  } catch (error) {
    console.error('Error saving location to localStorage:', error);
  }
};

export const getSavedUserLocation = (): { lat: number; lng: number } | null => {
  try {
    const savedLocation = localStorage.getItem(USER_LOCATION_KEY);
    if (!savedLocation) return null;
    
    const parsed = JSON.parse(savedLocation);
    
    // Validação básica de formato
    if (typeof parsed !== 'object' || 
        parsed === null || 
        typeof parsed.lat !== 'number' || 
        typeof parsed.lng !== 'number') {
      console.warn('Invalid location format in localStorage');
      localStorage.removeItem(USER_LOCATION_KEY);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error retrieving location from localStorage:', error);
    localStorage.removeItem(USER_LOCATION_KEY);
    return null;
  }
};

// Função para calcular distância entre duas coordenadas (em metros)
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  if (!window.google?.maps?.geometry?.spherical) {
    // Implementação alternativa do cálculo de distância se a API do Google não estiver disponível
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371000; // Raio da Terra em metros
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  return google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(lat1, lng1),
    new google.maps.LatLng(lat2, lng2)
  );
};
