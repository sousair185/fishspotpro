
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, MessageSquare, Eye, Info } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useFollow } from '@/hooks/useFollow';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserSearchProps {
  onSelectUser?: (userId: string, userName: string | null, userPhotoURL: string | null) => void;
}

const UserSearchTab: React.FC<UserSearchProps> = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { users, loading, searchUsers } = useUserSearch();
  const { followUser, unfollowUser, isFollowing } = useFollow();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Iniciando busca por:', searchTerm);
      searchUsers(searchTerm);
    }
  };
  
  const handleFollow = async (userId: string, userName: string | null) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para seguir usuários',
        variant: 'destructive'
      });
      return;
    }
    
    const alreadyFollowing = isFollowing(userId);
    
    if (alreadyFollowing) {
      await unfollowUser(userId);
      toast({
        title: 'Sucesso',
        description: `Você deixou de seguir ${userName || 'o usuário'}`
      });
    } else {
      await followUser(userId);
      toast({
        title: 'Sucesso',
        description: `Você começou a seguir ${userName || 'o usuário'}`
      });
    }
  };
  
  const handleMessage = (userId: string, userName: string | null, userPhotoURL: string | null) => {
    if (onSelectUser) {
      onSelectUser(userId, userName, userPhotoURL);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Buscar Usuários</h2>
      
      <form onSubmit={handleSearch} className="flex mb-4">
        <Input
          placeholder="Buscar por nome, email ou localização..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2"
        />
        <Button type="submit" disabled={!searchTerm.trim() || loading}>
          <Search className="h-4 w-4 mr-1" /> Buscar
        </Button>
      </form>
      
      <Alert variant="outline" className="mb-3">
        <Info className="h-4 w-4 mr-1" />
        <AlertDescription>
          Busque pelo nome do usuário, email ou localização. Digite pelo menos 3 caracteres.
        </AlertDescription>
      </Alert>
      
      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Buscando usuários...</p>
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-3">
          {users.map(userProfile => (
            <Card key={userProfile.uid} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile.photoURL || undefined} />
                      <AvatarFallback>{userProfile.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium">{userProfile.displayName || 'Usuário'}</p>
                      {userProfile.location && (
                        <p className="text-xs text-muted-foreground">{userProfile.location}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {user && user.uid !== userProfile.uid && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollow(userProfile.uid, userProfile.displayName)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          {isFollowing(userProfile.uid) ? 'Deixar de Seguir' : 'Seguir'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMessage(userProfile.uid, userProfile.displayName, userProfile.photoURL)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Mensagem
                        </Button>
                      </>
                    )}
                    
                    <Link to={`/user/${userProfile.uid}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Perfil
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchTerm && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          <p className="text-sm mt-2">Tente outros termos de busca ou verifique se o usuário está registrado.</p>
        </div>
      )}
    </div>
  );
};

export default UserSearchTab;
