
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

const SpotForm = ({ isOpen, onClose, coordinates, onSpotAdded, userId }: SpotFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFish, setSelectedFish] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [agreement, setAgreement] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

      const newSpot = {
        name,
        description,
        coordinates,
        type: 'river', // Você pode adicionar um seletor para isso depois
        species: selectedFish,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        images: imageUrls,
        reactions: [],
      };

      const docRef = await addDoc(collection(db, 'spots'), newSpot);
      onSpotAdded({ ...newSpot, id: docRef.id });
      
      toast({
        title: "Spot adicionado!",
        description: "Seu spot foi adicionado com sucesso"
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar spot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o spot",
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
          <DialogTitle>Adicionar Novo Spot</DialogTitle>
          <DialogDescription>
            Preencha as informações sobre o ponto de pesca
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="name">Nome do local</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lago dos Tucunarés"
              required
            />
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o local e dicas importantes"
              required
            />
          </div>

          <div className="grid w-full gap-2">
            <Label>Peixes encontrados</Label>
            <Select onValueChange={(value) => setSelectedFish([...selectedFish, value])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione os peixes" />
              </SelectTrigger>
              <SelectContent>
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
                  <div key={fish} className="bg-secondary px-2 py-1 rounded-full text-sm">
                    {fish}
                  </div>
                ))}
              </div>
            )}
          </div>

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
              por este spot
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !agreement}>
              {loading ? "Salvando..." : "Salvar Spot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SpotForm;
