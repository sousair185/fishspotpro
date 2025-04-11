import React from 'react';
import { Edit, MapPin, Globe, Calendar } from 'lucide-react';
import { UserProfile } from '@/types/social';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfileCardProps {
  profile: UserProfile | null;
  loading: boolean;
  onEditProfile?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile, loading, onEditProfile }) => {
  const { user } = useAuth();
  const { isFollowing, followUser, unfollowUser } = useFollow();
  
  const isCurrentUser = user && profile && user.uid === profile.uid;
  const isFollowingUser = profile ? isFollowing(profile.uid) : false;
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-40 mt-4" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardFooter>
      </Card>
    );
  }
  
  if (!profile) {
    return (
      <Card>
        <CardHeader className="text-center">
          <p>Perfil não encontrado</p>
        </CardHeader>
      </Card>
    );
  }
  
  const handleFollowToggle = async () => {
    if (isFollowingUser) {
      await unfollowUser(profile.uid);
    } else {
      await followUser(profile.uid);
    }
  };
  
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.photoURL || undefined} alt={profile.displayName || 'Usuário'} />
            <AvatarFallback>{profile.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold mt-4">{profile.displayName || 'Usuário'}</h2>
          
          {profile.bio && (
            <p className="text-muted-foreground mt-2 text-center">{profile.bio}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {profile.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{profile.location}</span>
            </div>
          )}
          
          {profile.website && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Globe className="h-4 w-4 mr-2" />
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex justify-between w-full">
          <div className="text-center">
            <p className="font-bold">{profile.posts}</p>
            <p className="text-xs text-muted-foreground">Postagens</p>
          </div>
          
          <div className="text-center">
            <p className="font-bold">{profile.followers}</p>
            <p className="text-xs text-muted-foreground">Seguidores</p>
          </div>
          
          <div className="text-center">
            <p className="font-bold">{profile.following}</p>
            <p className="text-xs text-muted-foreground">Seguindo</p>
          </div>
        </div>
      </CardFooter>
      
      <div className="px-6 pb-6">
        {isCurrentUser ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onEditProfile}
          >
            <Edit className="h-4 w-4 mr-2" /> Editar perfil
          </Button>
        ) : (
          <Button 
            variant={isFollowingUser ? "outline" : "default"} 
            className="w-full" 
            onClick={handleFollowToggle}
          >
            {isFollowingUser ? 'Deixar de seguir' : 'Seguir'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default UserProfileCard;
