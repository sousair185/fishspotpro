
import React from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface SpotReactionsProps {
  spotId: string;
  reactions: Reaction[];
  onReactionUpdated: () => void;
}

const REACTIONS = [
  { emoji: '🎣', label: 'Pescaria boa' },
  { emoji: '😕', label: 'Não pescou nada' },
  { emoji: '🐟', label: 'Muitos peixes' },
  { emoji: '👍', label: 'Recomendo' },
];

const SpotReactions = ({ spotId, reactions, onReactionUpdated }: SpotReactionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleReaction = async (emoji: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para reagir aos spots",
        variant: "destructive"
      });
      return;
    }

    try {
      const spotRef = doc(db, 'spots', spotId);
      const existingReaction = reactions.find(r => r.emoji === emoji);
      const userReacted = existingReaction?.users.includes(user.uid);

      if (userReacted) {
        await updateDoc(spotRef, {
          [`reactions.${emoji}.users`]: arrayRemove(user.uid),
          [`reactions.${emoji}.count`]: (existingReaction.count - 1)
        });
      } else {
        await updateDoc(spotRef, {
          [`reactions.${emoji}.users`]: arrayUnion(user.uid),
          [`reactions.${emoji}.count`]: ((existingReaction?.count || 0) + 1)
        });
      }

      onReactionUpdated();
    } catch (error) {
      console.error('Erro ao reagir:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar sua reação",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map(({ emoji, label }) => {
        const reaction = reactions.find(r => r.emoji === emoji);
        const userReacted = reaction?.users.includes(user?.uid || '');

        return (
          <Button
            key={emoji}
            variant={userReacted ? "default" : "outline"}
            size="sm"
            onClick={() => handleReaction(emoji)}
            className="gap-1"
          >
            <span>{emoji}</span>
            <span>{label}</span>
            {reaction?.count > 0 && (
              <span className="ml-1 text-xs">({reaction.count})</span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default SpotReactions;
