
import React, { useState } from 'react';
import { Share2, Navigation } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { FishingSpot } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';

interface SpotShareProps {
  spot: FishingSpot;
}

export function SpotShare({ spot }: SpotShareProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const appUrl = window.location.origin;
  const shareText = `Utilize o aplicativo FishSpot Pro para encontrar os melhores pontos de pesca: ${appUrl}?lat=${spot.coordinates[1]}&lng=${spot.coordinates[0]}&spotId=${spot.id}`;
  
  const shareViaWhatsApp = () => {
    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Link copiado",
      description: "Link compartilhado via WhatsApp"
    });
    
    setOpen(false);
  };
  
  const navigateToSpot = () => {
    // Open in Google Maps (works for both iOS and Android)
    const lat = spot.coordinates[1];
    const lng = spot.coordinates[0];
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    
    // Try to open in native maps app first (more reliable on mobile)
    const mapsUrl = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(spot.name)})`;
    
    // Create a link element to try opening the geo URI
    const link = document.createElement('a');
    link.href = mapsUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    
    // Small delay then try Google Maps as fallback
    setTimeout(() => {
      window.open(googleMapsUrl, '_blank');
    }, 300);
    
    document.body.removeChild(link);
    
    toast({
      title: "Navegação iniciada",
      description: "Abrindo GPS para navegação"
    });
    
    setOpen(false);
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={shareViaWhatsApp} className="cursor-pointer">
          Compartilhar via WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={navigateToSpot} className="cursor-pointer">
          <Navigation className="mr-2 h-4 w-4" />
          Navegar até este local
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
