
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
import { useIsMobile } from '@/hooks/use-mobile';

interface UserSearchProps {
  onSelectUser?: (userId: string, userName: string | null, userPhotoURL: string | null) => void;
}

const UserSearchTab: React.FC<UserSearchProps> = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { users, loading, searchUsers } = useUserSearch();
  const { followUser, unfollowUser, isFollowing } = useFollow();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
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
      <h2 className="text-xl font-semibold text-gradient">Buscar Usuários</h2>
      
      <form onSubmit={handleSearch} className="flex mb-4">
        <Input
          placeholder="Buscar por nome, email ou localização..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2 border-accent/20 focus:border-accent"
        />
        <Button type="submit" disabled={!searchTerm.trim() || loading} className="app-button bg-gradient-to-r from-primary to-accent text-white">
          <Search className="h-4 w-4 mr-1" /> Buscar
        </Button>
      </form>
      
      <Alert className="mb-3 border-accent/30 bg-accent/10">
        <Info className="h-4 w-4 mr-1 text-accent" />
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
            <Card key={userProfile.uid} className="hover:bg-accent/5 transition-colors card-hover">
              <CardContent className={`p-4 ${isMobile ? 'px-2 py-3' : ''}`}>
                <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2 border-accent/20">
                      <AvatarImage src={userProfile.photoURL || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">{userProfile.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium">{userProfile.displayName || 'Usuário'}</p>
                      {userProfile.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          {userProfile.location}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className={`flex ${isMobile ? 'mt-3 justify-between' : 'items-center space-x-2'}`}>
                    {user && user.uid !== userProfile.uid && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleFollow(userProfile.uid, userProfile.displayName)}
                          className="app-button bg-gradient-to-r from-primary to-primary/80"
                        >
                          <UserPlus className="h-4 w-4 mr-1 text-white" />
                          {isFollowing(userProfile.uid) ? 'Deixar' : 'Seguir'}
                        </Button>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleMessage(userProfile.uid, userProfile.displayName, userProfile.photoURL)}
                          className="app-button bg-gradient-to-r from-accent to-accent/80"
                        >
                          <MessageSquare className="h-4 w-4 mr-1 text-white" />
                          Mensagem
                        </Button>
                      </>
                    )}
                    
                    <Link to={`/user/${userProfile.uid}`}>
                      <Button variant="ghost" size="sm" className="app-button hover:bg-secondary/20">
                        <Eye className="h-4 w-4 mr-1 text-secondary" />
                        {isMobile ? '' : 'Ver Perfil'}
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
