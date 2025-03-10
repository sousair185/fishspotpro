
import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface SpotLikeProps {
  spotId: string;
  likes: string[];
  likeCount: number;
  onLikeUpdate?: () => void;
}

export const SpotLike = ({ spotId, likes, likeCount, onLikeUpdate }: SpotLikeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isLiked = user ? likes.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir spots",
        variant: "destructive"
      });
      return;
    }

    try {
      const spotRef = doc(db, 'spots', spotId);
      await updateDoc(spotRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likeCount: isLiked ? likeCount - 1 : likeCount + 1
      });

      toast({
        title: isLiked ? "Like removido" : "Spot curtido!",
        description: isLiked ? "Você removeu seu like deste spot" : "Você curtiu este spot"
      });

      if (onLikeUpdate) {
        onLikeUpdate();
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: "Erro ao curtir",
        description: "Não foi possível atualizar o like",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className={`gap-2 ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}
    >
      <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likeCount}</span>
    </Button>
  );
};
