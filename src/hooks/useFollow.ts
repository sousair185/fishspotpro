
import { useEffect } from 'react';
import { useFollowBase } from './social/useFollowBase';
import { useFollowQueries } from './social/useFollowQueries';
import { useFollowActions } from './social/useFollowActions';

export const useFollow = () => {
  const { following, followers, loading, user } = useFollowBase();
  const { fetchFollowing, fetchFollowers } = useFollowQueries();
  const { followUser, unfollowUser, isFollowing } = useFollowActions();
  
  // Inicializar os dados quando o usuário for definido
  useEffect(() => {
    if (user) {
      fetchFollowing();
      fetchFollowers();
    }
  }, [user]);
  
  return {
    following,
    followers,
    loading,
    fetchFollowing,
    fetchFollowers,
    followUser,
    unfollowUser,
    isFollowing
  };
};
