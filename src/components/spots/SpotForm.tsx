
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

const SpotForm = ({ isOpen, onClose, coordinates, onSpotAdded, userId }: SpotFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFishInput, setSelectedFishInput] = useState('');
  const [selectedInterestInput, setSelectedInterestInput] = useState('');
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

    // Validar que alguma informação foi inserida nos campos específicos
    if (isAdmin && !selectedInterestInput.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe a área de interesse",
        variant: "destructive"
      });
      return;
    }

    if (!isAdmin && !selectedFishInput.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe as espécies de peixes encontradas",
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

      // Processar os inputs de texto para criar arrays
      const speciesArray = isAdmin 
        ? selectedInterestInput.split(',').map(s => s.trim()).filter(s => s)
        : selectedFishInput.split(',').map(s => s.trim()).filter(s => s);

      const newSpot: Omit<FishingSpot, 'id'> = {
        name,
        description,
        coordinates,
        type: isAdmin ? 'establishment' : 'river',  // Tipo diferente para estabelecimentos
        species: speciesArray,  // Usar interesses ou peixes como array
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
            // Campo de áreas de interesse para administradores (input de texto)
            <div className="grid w-full gap-2">
              <Label htmlFor="interests">Área de interesse</Label>
              <Input
                id="interests"
                value={selectedInterestInput}
                onChange={(e) => setSelectedInterestInput(e.target.value)}
                placeholder="Loja de Pesca, Aluguel de Barcos, etc. (separados por vírgula)"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Insira as áreas de interesse separadas por vírgula
              </p>
            </div>
          ) : (
            // Campo de peixes para usuários normais (input de texto)
            <div className="grid w-full gap-2">
              <Label htmlFor="fish">Peixes encontrados</Label>
              <Input
                id="fish"
                value={selectedFishInput}
                onChange={(e) => setSelectedFishInput(e.target.value)}
                placeholder="Tucunaré, Tilápia, Dourado, etc. (separados por vírgula)"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Insira os tipos de peixes separados por vírgula
              </p>
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

