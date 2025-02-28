
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection } from 'firebase/firestore';
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

// Função para verificar se um usuário é administrador
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      return true;
    }
    
    // Verificar o usuário específico (hard-coded) que você mencionou
    if (uid === '5n2fQk0equVsHIUJmUDhUXwyPeF2') {
      // Se o documento não existir ou não tiver o papel de administrador, criá-lo
      await setDoc(userRef, { role: 'admin', promotedAt: new Date().toISOString() }, { merge: true });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao verificar se o usuário é administrador:", error);
    return false;
  }
};

// Função para tornar um usuário administrador
export const promoteToAdmin = async (currentUserUid: string, targetUserUid: string): Promise<boolean> => {
  try {
    // Verifica se o usuário atual é um administrador
    const isAdmin = await isUserAdmin(currentUserUid);
    
    if (!isAdmin) {
      console.error("Usuário não autorizado a promover outros usuários");
      return false;
    }
    
    // Promove o usuário alvo a administrador
    const targetUserRef = doc(db, 'users', targetUserUid);
    await setDoc(targetUserRef, { 
      role: 'admin', 
      promotedAt: new Date().toISOString(),
      promotedBy: currentUserUid
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Erro ao promover usuário:", error);
    return false;
  }
};

export default app;
