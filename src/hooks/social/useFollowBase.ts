
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { useToast } from '../use-toast';

export const useFollowBase = () => {
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  return {
    following,
    setFollowing,
    followers,
    setFollowers,
    loading,
    setLoading,
    user,
    toast
  };
};
