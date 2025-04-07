
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'user';
  isAdmin?: boolean;  // Added this property
  vip?: {
    isVip: boolean;
    promotedAt: string;
    expiresAt: string;
    promotedBy: string;
  };
}

export interface VipPromotion {
  userId: string;
  durationDays: number;
}
