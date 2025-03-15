
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
    return savedLocation ? JSON.parse(savedLocation) : null;
  } catch (error) {
    console.error('Error retrieving location from localStorage:', error);
    return null;
  }
};
