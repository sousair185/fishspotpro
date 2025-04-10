
import React, { useState, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfile } from '@/types/social';
import { ImagePlus } from 'lucide-react';

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile | null;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ isOpen, onClose, currentProfile }) => {
  const [displayName, setDisplayName] = useState(currentProfile?.displayName || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [location, setLocation] = useState(currentProfile?.location || '');
  const [website, setWebsite] = useState(currentProfile?.website || '');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentProfile?.photoURL);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUserProfile } = useUserProfile();
  
  // Função para lidar com a seleção de imagem
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Criar URL de prévia
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Função para salvar o perfil
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const updatedProfile: Partial<UserProfile> = {
        displayName,
        bio,
        location,
        website
      };
      
      await updateUserProfile(updatedProfile, profileImage || undefined);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || undefined} />
                <AvatarFallback>{displayName.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              
              <Button
                type="button"
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
              
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                ref={fileInputRef}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="exemplo.com"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileForm;
