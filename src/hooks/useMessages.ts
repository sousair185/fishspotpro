
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  or,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Message } from '@/types/social';

export const useMessages = () => {
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [outboxMessages, setOutboxMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch mensagens recebidas
  const fetchInboxMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('recipientId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          senderPhotoURL: data.senderPhotoURL,
          recipientId: data.recipientId,
          recipientName: data.recipientName,
          recipientPhotoURL: data.recipientPhotoURL,
          content: data.content,
          createdAt: data.createdAt.toDate().toISOString(),
          read: data.read
        });
      });
      
      setInboxMessages(messages);
      
      // Contar mensagens não lidas
      const unread = messages.filter(msg => !msg.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erro ao buscar mensagens recebidas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas mensagens recebidas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch mensagens enviadas
  const fetchOutboxMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('senderId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          senderPhotoURL: data.senderPhotoURL,
          recipientId: data.recipientId,
          recipientName: data.recipientName,
          recipientPhotoURL: data.recipientPhotoURL,
          content: data.content,
          createdAt: data.createdAt.toDate().toISOString(),
          read: data.read
        });
      });
      
      setOutboxMessages(messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens enviadas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas mensagens enviadas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Enviar uma nova mensagem
  const sendMessage = async (recipientId: string, recipientName: string | null, recipientPhotoURL: string | null, content: string) => {
    if (!user || !content.trim()) return false;
    
    try {
      setLoading(true);
      const messagesRef = collection(db, 'messages');
      
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName,
        senderPhotoURL: user.photoURL,
        recipientId,
        recipientName,
        recipientPhotoURL,
        content: content.trim(),
        createdAt: serverTimestamp(),
        read: false
      });
      
      toast({
        title: 'Mensagem enviada',
        description: 'Sua mensagem foi enviada com sucesso'
      });
      
      // Recarregar mensagens enviadas
      await fetchOutboxMessages();
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar sua mensagem',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Marcar mensagem como lida
  const markMessageAsRead = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        read: true
      });
      
      // Atualizar o estado local
      setInboxMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
      
      // Recalcular contagem de não lidas
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      return false;
    }
  };

  // Configurar listener para atualizações de mensagens
  useEffect(() => {
    if (!user) return;
    
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
      
      // Atualizar inbox se tiver novas mensagens
      if (snapshot.docChanges().length > 0) {
        fetchInboxMessages();
      }
    });
    
    return () => unsubscribe();
  }, [user]);

  // Carregar mensagens iniciais
  useEffect(() => {
    if (user) {
      fetchInboxMessages();
      fetchOutboxMessages();
    }
  }, [user]);

  return {
    inboxMessages,
    outboxMessages,
    unreadCount,
    loading,
    activeConversation,
    setActiveConversation,
    fetchInboxMessages,
    fetchOutboxMessages,
    sendMessage,
    markMessageAsRead
  };
};
