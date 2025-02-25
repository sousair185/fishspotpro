
import React from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface SpotPlacesSearchProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
}

const SpotPlacesSearch = ({ onPlaceSelected }: SpotPlacesSearchProps) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  if (!isLoaded) return null;

  return (
    <div className="grid w-full gap-2">
      <Label htmlFor="location">Buscar local</Label>
      <Autocomplete
        onLoad={(autocomplete) => {
          autocomplete.setFields(['name', 'geometry', 'formatted_address']);
        }}
        onPlaceChanged={() => {
          const autocomplete = document.querySelector('input') as HTMLInputElement;
          const place = autocomplete?.value;
          if (place) {
            onPlaceSelected(place as any);
          }
        }}
      >
        <Input
          id="location"
          type="text"
          placeholder="Digite para buscar um local"
          className="w-full"
        />
      </Autocomplete>
    </div>
  );
};

export default SpotPlacesSearch;
