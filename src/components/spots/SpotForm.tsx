
import React, { useState, useEffect } from 'react';
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
import { db, storage, canAddMoreSpots } from '@/lib/firebase';
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
  const [isPrivate, setIsPrivate] = useState(false);
  const [canAddPrivateSpot, setCanAddPrivateSpot] = useState(true);
  const { toast } = useToast();
  const { isAdmin, isVip } = useAuth();

  useEffect(() => {
    const checkSpotLimit = async () => {
      if (!isAdmin && !isVip) {
        const canAdd = await canAddMoreSpots(userId);
        setCanAddPrivateSpot(canAdd);
      }
    };
    
    checkSpotLimit();
  }, [userId, isAdmin, isVip]);

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

    // Verificar se o usuário pode adicionar um spot privado
    if (isPrivate && !isAdmin && !isVip && !canAddPrivateSpot) {
      toast({
        title: "Limite atingido",
        description: "Usuários comuns podem ter no máximo 2 spots privativos. Considere se tornar VIP para adicionar mais.",
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
        status: isAdmin ? 'approved' : (isPrivate ? 'private' : 'pending'),  // Spots privados não precisam de aprovação
        isPrivate: isPrivate,
        likes: [],
        likeCount: 0
      };

      const docRef = await addDoc(collection(db, 'spots'), newSpot);
      onSpotAdded({ ...newSpot, id: docRef.id });
      
      let toastMessage = "";
      if (isAdmin) {
        toastMessage = "Estabelecimento adicionado com sucesso.";
      } else if (isPrivate) {
        toastMessage = "Spot privado adicionado! Apenas você pode vê-lo.";
      } else {
        toastMessage = "Spot enviado para aprovação! Será revisado em breve.";
      }
      
      toast({
        title: "Spot adicionado!",
        description: toastMessage
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

          {!isAdmin && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrivate"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                disabled={!canAddPrivateSpot && !isVip}
              />
              <div>
                <Label htmlFor="isPrivate" className="text-sm">
                  Spot privativo (apenas para meu uso)
                </Label>
                {!canAddPrivateSpot && !isVip && (
                  <p className="text-xs text-muted-foreground">
                    Você atingiu o limite de 2 spots privativos. Torne-se VIP para adicionar mais.
                  </p>
                )}
                {isVip && (
                  <p className="text-xs text-yellow-600">
                    Como VIP você pode adicionar mais spots privativos.
                  </p>
                )}
              </div>
            </div>
          )}

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
              {loading ? "Salvando..." : isAdmin ? "Adicionar Estabelecimento" : (isPrivate ? "Adicionar Spot Privado" : "Enviar para aprovação")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SpotForm;
