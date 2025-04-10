
import React, { useState, useRef } from 'react';
import { Image, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createPost } = useSocialPosts();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Função para lidar com seleção de imagem
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'A imagem deve ter menos de 5MB',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedImage(file);
      
      // Criar URL de prévia
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Função para remover a imagem selecionada
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Função para criar uma nova postagem
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar uma postagem',
        variant: 'destructive'
      });
      return;
    }
    
    if (!content.trim() && !selectedImage) {
      toast({
        title: 'Erro',
        description: 'A postagem precisa ter texto ou imagem',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await createPost(content, selectedImage || undefined);
      
      // Limpar formulário
      setContent('');
      setSelectedImage(null);
      setPreviewUrl(null);
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Erro ao criar postagem:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <Avatar>
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <textarea
                placeholder="O que está acontecendo?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[100px] bg-transparent border-none resize-none focus:outline-none"
              />
              
              {/* Prévia da imagem selecionada */}
              {previewUrl && (
                <div className="relative mt-2 rounded-md overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-[300px] w-auto rounded-md" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-between">
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              ref={fileInputRef}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="h-5 w-5 mr-1" /> Imagem
            </Button>
          </div>
          
          <Button type="submit" disabled={isLoading || (!content.trim() && !selectedImage)}>
            {isLoading ? 'Publicando...' : 'Publicar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostForm;
