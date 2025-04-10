
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Heart, MessageSquare, MoreVertical, Trash2 } from 'lucide-react';
import { Post } from '@/types/social';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import CommentList from './CommentList';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { likePost, deletePost, checkIfLiked } = useSocialPosts();
  const { comments, loading: commentsLoading, fetchComments, addComment } = useComments(post.id);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  
  // Verificar se o usuário curtiu a postagem
  useEffect(() => {
    const checkLikeStatus = async () => {
      const liked = await checkIfLiked(post.id);
      setIsLiked(liked);
    };
    
    if (user) {
      checkLikeStatus();
    }
  }, [post.id, user]);
  
  // Buscar comentários quando o usuário expandir a seção de comentários
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);
  
  // Função para lidar com curtidas
  const handleLike = async () => {
    const liked = await likePost(post.id);
    setIsLiked(liked);
  };
  
  // Função para lidar com adição de comentários
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    await addComment(newComment);
    setNewComment('');
  };
  
  // Função para lidar com exclusão de postagens
  const handleDelete = async () => {
    await deletePost(post.id);
  };
  
  // Formatação de data relativa
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { 
    addSuffix: true,
    locale: ptBR
  });
  
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={post.userPhotoURL || undefined} alt={post.userName} />
            <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{post.userName}</h3>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        
        {/* Menu de opções (visível apenas para o autor da postagem) */}
        {user && user.uid === post.userId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="whitespace-pre-wrap mb-4">{post.content}</p>
        {post.imageURL && (
          <div className="relative w-full h-auto rounded-md overflow-hidden">
            <img
              src={post.imageURL}
              alt="Imagem da postagem"
              className="w-full h-auto object-cover rounded-md"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col pt-0 border-t">
        <div className="flex justify-between items-center w-full py-2">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-1" 
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{post.likes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-1" 
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-5 w-5" />
              <span>{post.comments}</span>
            </Button>
          </div>
        </div>
        
        {/* Seção de comentários */}
        {showComments && (
          <div className="w-full pt-2">
            <CommentList comments={comments} postId={post.id} loading={commentsLoading} />
            
            {/* Formulário de comentário */}
            {user && (
              <form onSubmit={handleAddComment} className="flex items-center mt-4">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <input
                  type="text"
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-muted/50 px-3 py-2 text-sm rounded-full"
                />
                <Button type="submit" size="sm" className="ml-2" disabled={!newComment.trim()}>
                  Enviar
                </Button>
              </form>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
