
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBCIKn4GGfK9BJbrMPQNh22J8yQpw_y-cc",
  authDomain: "fishspotpro.firebaseapp.com",
  projectId: "fishspotpro",
  storageBucket: "fishspotpro.firebasestorage.app",
  messagingSenderId: "70406179433",
  appId: "1:70406179433:web:b119faf7612f0a5c1df0f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
