
import React from 'react';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SpotBoostProps {
  spotId: string;
  boosted?: {
    startDate: string;
    endDate: string;
    boostedBy: string;
  };
  onBoostUpdate?: () => void;
}

export const SpotBoost = ({ spotId, boosted, onBoostUpdate }: SpotBoostProps) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [days, setDays] = React.useState('7');
  const [open, setOpen] = React.useState(false);

  if (!isAdmin) return null;

  const handleBoost = async () => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(days));

      const spotRef = doc(db, 'spots', spotId);
      await updateDoc(spotRef, {
        boosted: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          boostedBy: user!.uid
        }
      });

      toast({
        title: "Spot impulsionado!",
        description: `Este spot ficará em destaque por ${days} dias`
      });

      if (onBoostUpdate) {
        onBoostUpdate();
      }
      setOpen(false);
    } catch (error) {
      console.error('Error boosting spot:', error);
      toast({
        title: "Erro ao impulsionar",
        description: "Não foi possível impulsionar o spot",
        variant: "destructive"
      });
    }
  };

  const isCurrentlyBoosted = boosted && new Date(boosted.endDate) > new Date();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isCurrentlyBoosted ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Rocket className="h-4 w-4" />
          {isCurrentlyBoosted ? "Impulsionado" : "Impulsionar"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impulsionar Spot</DialogTitle>
          <DialogDescription>
            Defina por quantos dias este spot ficará em destaque
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            min="1"
            max="30"
            placeholder="Número de dias"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleBoost}>
            Impulsionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
