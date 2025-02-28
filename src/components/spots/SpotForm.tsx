
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { FishingSpot } from '@/types/spot';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/hooks/useAuth';

interface SpotFormProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: [number, number];
  onSpotAdded: (spot: FishingSpot) => void;
  userId: string;
}

const fishTypes = [
  'Tucunaré',
  'Tilápia',
  'Dourado',
  'Traíra',
  'Tambaqui',
  'Pintado',
  'Pacu',
  'Outro'
];

const interestAreas = [
  'Loja de Pesca',
  'Aluguel de Barcos',
  'Guia de Pesca',
  'Hotel/Pousada',
  'Restaurante',
  'Marina',
  'Camping',
  'Área de Lazer',
  'Outra'
];

const SpotForm = ({ isOpen, onClose, coordinates, onSpotAdded, userId }: SpotFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFish, setSelectedFish] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [agreement, setAgreement] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      toast({
        title: "Limite de imagens",
        description: "Você pode enviar no máximo 2 fotos",
        variant: "destructive"
      });
      return;
    }
    setImages(files);
  };

  const handleAddFish = (value: string) => {
    if (!selectedFish.includes(value)) {
      setSelectedFish([...selectedFish, value]);
    }
  };

  const handleRemoveFish = (fishToRemove: string) => {
    setSelectedFish(selectedFish.filter(fish => fish !== fishToRemove));
  };

  const handleAddInterest = (value: string) => {
    if (!selectedInterests.includes(value)) {
      setSelectedInterests([...selectedInterests, value]);
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setSelectedInterests(selectedInterests.filter(interest => interest !== interestToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) {
      toast({
        title: "Acordo necessário",
        description: "Você precisa concordar com os termos para continuar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Verificar se já existe um spot próximo
      const spotsRef = collection(db, 'spots');
      const nearbySpots = await getDocs(query(spotsRef, 
        where('coordinates', '==', coordinates)
      ));

      if (!nearbySpots.empty) {
        toast({
          title: "Spot já existe",
          description: "Já existe um spot registrado neste local",
          variant: "destructive"
        });
        return;
      }

      // Upload das imagens
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const storageRef = ref(storage, `spots/${Date.now()}-${image.name}`);
          const snapshot = await uploadBytes(storageRef, image);
          return getDownloadURL(snapshot.ref);
        })
      );

      const newSpot: Omit<FishingSpot, 'id'> = {
        name,
        description,
        coordinates,
        type: isAdmin ? 'establishment' : 'river',  // Tipo diferente para estabelecimentos
        species: isAdmin ? selectedInterests : selectedFish,  // Usar interesses ou peixes dependendo do tipo de usuário
        createdBy: userId,
        createdAt: new Date().toISOString(),
        images: imageUrls,
        reactions: [],
        status: isAdmin ? 'approved' : 'pending',  // Spots criados por admins já são aprovados
      };

      const docRef = await addDoc(collection(db, 'spots'), newSpot);
      onSpotAdded({ ...newSpot, id: docRef.id });
      
      toast({
        title: isAdmin ? "Estabelecimento adicionado!" : "Spot enviado para aprovação!",
        description: isAdmin ? "O estabelecimento foi adicionado com sucesso." : "Seu spot foi enviado e será revisado em breve."
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar spot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o local",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isAdmin ? "Adicionar Estabelecimento" : "Adicionar Novo Spot"}</DialogTitle>
          <DialogDescription>
            {isAdmin 
              ? "Preencha as informações sobre o estabelecimento relacionado à pesca" 
              : "Preencha as informações sobre o ponto de pesca"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="name">Nome do local</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAdmin ? "Ex: Loja do Pescador" : "Ex: Lago dos Tucunarés"}
              required
            />
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAdmin 
                ? "Descreva o estabelecimento, horário de funcionamento, contatos, etc." 
                : "Descreva o local e dicas importantes"}
              required
            />
          </div>

          {isAdmin ? (
            // Campo de áreas de interesse para administradores
            <div className="grid w-full gap-2">
              <Label>Área de interesse</Label>
              <Select onValueChange={handleAddInterest}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione categorias" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {interestAreas.map((interest) => (
                    <SelectItem key={interest} value={interest}>
                      {interest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedInterests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedInterests.map((interest) => (
                    <div 
                      key={interest} 
                      className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm flex items-center gap-1"
                      onClick={() => handleRemoveInterest(interest)}
                    >
                      <span>{interest}</span>
                      <button 
                        type="button" 
                        className="text-xs font-bold hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveInterest(interest);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Campo de peixes para usuários normais
            <div className="grid w-full gap-2">
              <Label>Peixes encontrados</Label>
              <Select onValueChange={handleAddFish}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione os peixes" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {fishTypes.map((fish) => (
                    <SelectItem key={fish} value={fish}>
                      {fish}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFish.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFish.map((fish) => (
                    <div 
                      key={fish} 
                      className="bg-secondary px-3 py-1.5 rounded-full text-sm flex items-center gap-1"
                      onClick={() => handleRemoveFish(fish)}
                    >
                      <span>{fish}</span>
                      <button 
                        type="button" 
                        className="text-xs font-bold hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFish(fish);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid w-full gap-2">
            <Label htmlFor="images">Fotos (máx. 2)</Label>
            <Input
              id="images"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              multiple
              max={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreement"
              checked={agreement}
              onCheckedChange={(checked) => setAgreement(checked as boolean)}
            />
            <Label htmlFor="agreement" className="text-sm">
              Declaro que as informações fornecidas são verdadeiras e assumo a responsabilidade
              por este {isAdmin ? "estabelecimento" : "spot"}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !agreement}>
              {loading ? "Salvando..." : isAdmin ? "Adicionar Estabelecimento" : "Enviar para aprovação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SpotForm;
