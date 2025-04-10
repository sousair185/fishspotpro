
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { Comment } from '@/types/social';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentListProps {
  comments: Comment[];
  postId: string;
  loading: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ comments, postId, loading }) => {
  const { deleteComment } = useComments(postId);
  const { user } = useAuth();
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">Seja o primeiro a comentar.</p>;
  }
  
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.userPhotoURL || undefined} alt={comment.userName} />
            <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-sm">{comment.userName}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDistanceToNow(new Date(comment.createdAt), { 
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
              
              {/* Botão de excluir (visível apenas para o autor do comentário ou admin) */}
              {user && (user.uid === comment.userId || user.isAdmin) && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => deleteComment(comment.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>
            
            <p className="text-sm mt-1">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
