
export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  content: string;
  imageURL?: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  content: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string; // Usuário que está seguindo
  followingId: string; // Usuário que está sendo seguido
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email?: string | null;
  bio?: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  posts: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string | null;
  senderPhotoURL: string | null;
  recipientId: string;
  recipientName: string | null;
  recipientPhotoURL: string | null;
  content: string;
  createdAt: string;
  read: boolean;
}
