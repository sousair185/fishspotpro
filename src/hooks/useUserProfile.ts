
import { useUserProfileBase } from './profile/useUserProfileBase';
import { useUserProfileActions } from './profile/useUserProfileActions';

export const useUserProfile = (userId?: string) => {
  const { profile, loading, fetchUserProfile } = useUserProfileBase(userId);
  const { updateUserProfile } = useUserProfileActions(userId);
  
  return {
    profile,
    loading,
    fetchUserProfile,
    updateUserProfile
  };
};
