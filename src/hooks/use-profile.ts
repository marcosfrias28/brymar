"use client";

import { useState, useEffect } from "react";
import { useUser } from '@/presentation/hooks/use-user';
import { toast } from "sonner";
import { User } from '@/lib/db/schema';

export interface ProfileActivity {
  id: string;
  type: 'view' | 'favorite' | 'search' | 'contact' | 'message' | 'login' | 'profile' | 'favorites' | 'settings';
  title: string;
  description: string;
  details?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ProfileFavorite {
  id: string;
  type: 'property' | 'search';
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  createdAt: Date;
}

export interface ProfileNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface ProfileMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  subject: string;
  message: string;
  content: string;
  read: boolean;
  starred: boolean;
  archived: boolean;
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  propertyId?: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  attachments?: {
    name: string;
    size: string;
    url: string;
  }[];
}

/**
 * Hook per la gestione del profilo utente
 */
export function useProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        id: user.getId().value,
        name: user.getProfile().getFullName() || '',
        email: user.getEmail().value || '',
        firstName: user.getProfile().getFirstName() || '',
        lastName: user.getProfile().getLastName() || '',
        phone: user.getProfile().getPhone() || '',
        bio: user.getProfile().getBio() || '',
        location: user.getProfile().getLocation() || '',
        website: '',
        image: user.getProfile().getAvatar() || '',
        role: user.getRole().value || '',
        emailVerified: user.getStatus().isActive() || null,
        createdAt: user.getCreatedAt()?.value || null,
        updatedAt: user.getUpdatedAt()?.value || null,
        preferences: {
          notifications: {
            email: true,
            push: true,
            marketing: false,
          },
          privacy: {
            profileVisible: true,
            showEmail: false,
            showPhone: false,
          },
          display: {
            theme: 'system' as const,
            language: 'es',
          },
        },
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Profilo aggiornato con successo');
    } catch (err) {
      setError('Errore durante l\'aggiornamento del profilo');
      toast.error('Errore durante l\'aggiornamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}

/**
 * Hook per la gestione delle attività del profilo
 */
export function useProfileActivity() {
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula il caricamento delle attività
    setTimeout(() => {
      setActivities([
        {
          id: '1',
          type: 'view',
          title: 'Visualizzazione proprietà',
          description: 'Hai visualizzato Villa Moderna a Milano',
          details: 'Proprietà visualizzata per 5 minuti',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: '2',
          type: 'favorite',
          title: 'Aggiunto ai preferiti',
          description: 'Appartamento Centro Storico a Roma',
          details: 'Aggiunto alla lista dei preferiti',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          id: '3',
          type: 'search',
          title: 'Nuova ricerca',
          description: 'Ricerca: Appartamenti a Milano, 2-3 camere',
          details: 'Trovati 15 risultati',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
        {
          id: '4',
          type: 'login',
          title: 'Accesso effettuato',
          description: 'Login da dispositivo mobile',
          details: 'IP: 192.168.1.1',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        },
        {
          id: '5',
          type: 'profile',
          title: 'Profilo aggiornato',
          description: 'Modificate informazioni personali',
          details: 'Aggiornato numero di telefono',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return {
    activities,
    loading,
  };
}

/**
 * Hook per la gestione dei preferiti
 */
export function useProfileFavorites() {
  const [favorites, setFavorites] = useState<ProfileFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula il caricamento dei preferiti
    setTimeout(() => {
      setFavorites([
        {
          id: '1',
          type: 'property',
          title: 'Villa Moderna Milano',
          description: '4 camere, 3 bagni, giardino',
          url: '/properties/villa-moderna-milano',
          thumbnail: '/optimized_villa/1.webp',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        },
        {
          id: '2',
          type: 'search',
          title: 'Appartamenti Milano Centro',
          description: 'Ricerca salvata: 2-3 camere, €800-1200/mese',
          url: '/search?location=milano&rooms=2-3&price=800-1200',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const removeFavorite = async (id: string) => {
    try {
      setFavorites(prev => prev.filter(fav => fav.id !== id));
      toast.success('Rimosso dai preferiti');
    } catch (err) {
      toast.error('Errore durante la rimozione');
    }
  };

  return {
    favorites,
    loading,
    removeFavorite,
  };
}

/**
 * Hook per la gestione delle notifiche
 */
export function useProfileNotifications() {
  const [notifications, setNotifications] = useState<ProfileNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simula il caricamento delle notifiche
    setTimeout(() => {
      const mockNotifications = [
        {
          id: '1',
          type: 'info' as const,
          title: 'Nuova proprietà disponibile',
          message: 'Una nuova proprietà corrispondente ai tuoi criteri è disponibile',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          actionUrl: '/properties/new-property',
        },
        {
          id: '2',
          type: 'success' as const,
          title: 'Profilo aggiornato',
          message: 'Il tuo profilo è stato aggiornato con successo',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
      setLoading(false);
    }, 500);
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}

/**
 * Hook per la gestione dei messaggi
 */
export function useProfileMessages() {
  const [messages, setMessages] = useState<ProfileMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simula il caricamento dei messaggi
    setTimeout(() => {
      const mockMessages = [
        {
          id: '1',
          senderId: 'agent-1',
          senderName: 'Marco Rossi',
          senderAvatar: '/avatars/agent-1.jpg',
          subject: 'Informazioni Villa Milano',
          message: 'Salve, ho visto il suo interesse per la villa a Milano. Posso fornirle maggiori dettagli.',
          content: 'Salve, ho visto il suo interesse per la villa a Milano. Posso fornirle maggiori dettagli.',
          read: false,
          starred: false,
          archived: false,
          status: 'delivered' as const,
          createdAt: new Date(Date.now() - 1000 * 60 * 45),
          propertyId: 'villa-milano-1',
          sender: {
            id: 'agent-1',
            name: 'Marco Rossi',
            email: 'marco.rossi@brymar.com',
            avatar: '/avatars/agent-1.jpg'
          },
          attachments: []
        },
        {
          id: '2',
          senderId: 'admin-1',
          senderName: 'Supporto Brymar',
          subject: 'Benvenuto su Brymar',
          message: 'Benvenuto sulla nostra piattaforma! Siamo qui per aiutarti a trovare la casa dei tuoi sogni.',
          content: 'Benvenuto sulla nostra piattaforma! Siamo qui per aiutarti a trovare la casa dei tuoi sogni.',
          read: true,
          starred: false,
          archived: false,
          status: 'read' as const,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          sender: {
            id: 'admin-1',
            name: 'Supporto Brymar',
            email: 'supporto@brymar.com',
            avatar: '/avatars/support.jpg'
          },
          attachments: []
        },
      ];
      setMessages(mockMessages);
      setUnreadCount(mockMessages.filter(m => !m.read && !m.archived).length);
      setLoading(false);
    }, 700);
  }, []);

  const markAsRead = async (id: string) => {
    setMessages(prev =>
      prev.map(message =>
        message.id === id
          ? { ...message, read: true, status: 'read' as const }
          : message
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const sendMessage = async (data: { to: string; subject: string; content: string }) => {
    try {
      // Simulazione invio messaggio
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newMessage: ProfileMessage = {
        id: Date.now().toString(),
        senderId: 'current-user',
        senderName: 'Tu',
        subject: data.subject,
        message: data.content,
        content: data.content,
        read: true,
        starred: false,
        archived: false,
        status: 'sent',
        createdAt: new Date(),
        sender: {
          id: 'current-user',
          name: 'Tu',
          email: data.to,
          avatar: '/avatars/user.png'
        },
        attachments: []
      };

      setMessages(prev => [newMessage, ...prev]);
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      throw error;
    }
  };

  const toggleStar = async (id: string) => {
    try {
      // Simulazione toggle stella
      await new Promise(resolve => setTimeout(resolve, 300));

      setMessages(prev => prev.map(message =>
        message.id === id ? { ...message, starred: !message.starred } : message
      ));
    } catch (error) {
      console.error('Errore nell\'aggiornamento della stella:', error);
      throw error;
    }
  };

  const archiveMessage = async (id: string) => {
    try {
      // Simulazione archiviazione
      await new Promise(resolve => setTimeout(resolve, 500));

      setMessages(prev => prev.map(message =>
        message.id === id ? { ...message, archived: true } : message
      ));

      // Aggiorna il conteggio non letti se il messaggio era non letto
      const message = messages.find(m => m.id === id);
      if (message && !message.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Errore nell\'archiviazione del messaggio:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    unreadCount,
    markAsRead,
    sendMessage,
    toggleStar,
    archiveMessage,
  };
}