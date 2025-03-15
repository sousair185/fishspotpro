
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

// Função para verificar se um usuário é VIP
export const isUserVip = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().vip?.isVip) {
      // Verificar se o status VIP não expirou
      const expiresAt = new Date(userDoc.data().vip.expiresAt);
      const now = new Date();
      
      if (expiresAt > now) {
        return true;
      } else {
        // Se expirou, remover o status VIP
        await setDoc(userRef, { 
          vip: { 
            isVip: false,
            expiresAt: userDoc.data().vip.expiresAt
          } 
        }, { merge: true });
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao verificar se o usuário é VIP:", error);
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

// Função para promover um usuário a VIP
export const promoteToVip = async (currentUserUid: string, targetUserUid: string, durationDays: number): Promise<boolean> => {
  try {
    // Verifica se o usuário atual é um administrador
    const isAdmin = await isUserAdmin(currentUserUid);
    
    if (!isAdmin) {
      console.error("Usuário não autorizado a promover outros usuários a VIP");
      return false;
    }
    
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + durationDays);
    
    // Promove o usuário alvo a VIP
    const targetUserRef = doc(db, 'users', targetUserUid);
    await setDoc(targetUserRef, { 
      vip: {
        isVip: true,
        promotedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        promotedBy: currentUserUid
      }
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Erro ao promover usuário a VIP:", error);
    return false;
  }
};

// Função para verificar se um usuário pode adicionar mais spots
export const canAddMoreSpots = async (uid: string): Promise<boolean> => {
  try {
    // Verificar se é admin (admins não têm limitação)
    const admin = await isUserAdmin(uid);
    if (admin) return true;
    
    // Verificar se é VIP (VIPs não têm limitação)
    const vip = await isUserVip(uid);
    if (vip) return true;
    
    // Para usuários comuns, verificar quantos spots eles já criaram
    const spotsRef = collection(db, 'spots');
    const q = query(spotsRef, where('createdBy', '==', uid), where('isPrivate', '==', true));
    const snapshot = await getDocs(q);
    
    // Usuários comuns podem ter no máximo 2 spots privados
    return snapshot.size < 2;
  } catch (error) {
    console.error("Erro ao verificar se usuário pode adicionar mais spots:", error);
    return false;
  }
};

export default app;
