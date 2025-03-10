
import { FishingSpot } from '@/types/spot';

export function getMarkerIcon(spot: FishingSpot, isAdmin: boolean) {
  const isBoosted = spot.boosted && new Date(spot.boosted.endDate) > new Date();
  
  if (isBoosted) {
    return {
      url: `data:image/svg+xml;charset=UTF-8,
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="gold" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>`,
      scaledSize: new google.maps.Size(36, 36)
    };
  }
  
  if (spot.type === 'establishment') {
    return {
      url: `data:image/svg+xml;charset=UTF-8,
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="blue" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>`,
      scaledSize: new google.maps.Size(36, 36)
    };
  }
  
  if (isAdmin && spot.status !== 'approved') {
    return {
      url: `data:image/svg+xml;charset=UTF-8,
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${spot.status === 'pending' ? 'orange' : 'red'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>`,
      scaledSize: new google.maps.Size(36, 36)
    };
  }
  
  return undefined;
}
