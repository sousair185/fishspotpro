
// Create a function that returns the map options when Google Maps is loaded
export const getDefaultMapOptions = (): google.maps.MapOptions => {
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    // Return basic options if Google Maps isn't loaded yet
    return {
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: true,
      fullscreenControl: false,
    };
  }

  // Only use Google-specific options when the API is loaded
  return {
    mapTypeId: 'roadmap',
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    scaleControl: true,
    fullscreenControl: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }]
      }
    ],
    mapId: 'k9b3mrCq5TOP665GkQDj90RNOoc='
  };
};

// Default options that can be used before the API is loaded
export const defaultMapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: false,
};
