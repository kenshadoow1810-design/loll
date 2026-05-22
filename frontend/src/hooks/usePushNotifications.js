import { useEffect, useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se o navegador suporta notificações push
  useEffect(() => {
    const checkSupport = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsSupported(false);
        setError('Seu navegador não suporta notificações push');
        setLoading(false);
        return;
      }

      setIsSupported(true);

      // Verificar permissão atual
      setPermission(Notification.permission);

      // Carregar subscrição existente com timeout para evitar loading infinito
      try {
        await loadSubscription();
      } catch (err) {
        console.error('Erro ao carregar subscrição:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkSupport();
  }, []);

  // Carregar subscrição do Service Worker
  const loadSubscription = async () => {
    try {
      // Adicionar timeout para evitar loading infinito
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao carregar service worker')), 5000)
        )
      ]);
      
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        console.log('Subscrição encontrada:', existingSubscription.endpoint);
      }
    } catch (err) {
      console.error('Erro ao carregar subscrição:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Registrar Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration.scope);
      return registration;
    } catch (err) {
      console.error('Erro ao registrar Service Worker:', err);
      setError(err.message);
      throw err;
    }
  }, [isSupported]);

  // Solicitar permissão de notificação
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setError('Notificações não são suportadas neste navegador');
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission !== 'granted') {
      setError('Permissão de notificação negada');
      return false;
    }

    return true;
  }, []);

  // Obter chave pública VAPID do backend
  const getVapidPublicKey = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/vapid-public-key`);
      
      if (!response.ok) {
        throw new Error('Falha ao obter chave VAPID');
      }
      
      const data = await response.json();
      return data.publicKey;
    } catch (err) {
      console.error('Erro ao obter chave VAPID:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Assinar para receber notificações push
  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications não são suportadas');
    }

    try {
      // 1. Registrar Service Worker
      const registration = await registerServiceWorker();
      
      // 2. Solicitar permissão
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Permissão negada');
      }

      // 3. Obter chave VAPID
      const vapidPublicKey = await getVapidPublicKey();
      
      if (!vapidPublicKey) {
        throw new Error('Chave VAPID não disponível');
      }

      // 4. Subscrição no Push Manager
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      console.log('Nova subscrição criada:', newSubscription.endpoint);

      // 5. Enviar subscrição para o backend
      await sendSubscriptionToBackend(newSubscription);
      
      setSubscription(newSubscription);
      return newSubscription;
    } catch (err) {
      console.error('Erro ao subscrever para push:', err);
      setError(err.message);
      throw err;
    }
  }, [isSupported, registerServiceWorker, requestPermission, getVapidPublicKey]);

  // Enviar subscrição para o backend
  const sendSubscriptionToBackend = async (subscriptionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Falha ao salvar subscrição');
      }

      const result = await response.json();
      console.log('Subscrição salva no backend:', result);
      return result;
    } catch (err) {
      console.error('Erro ao enviar subscrição:', err);
      throw err;
    }
  };

  // Cancelar subscrição
  const unsubscribe = useCallback(async () => {
    if (!subscription) return true;

    try {
      const unsubscribed = await subscription.unsubscribe();
      
      if (unsubscribed) {
        setSubscription(null);
        console.log('Subscrição cancelada');
      }
      
      return unsubscribed;
    } catch (err) {
      console.error('Erro ao cancelar subscrição:', err);
      setError(err.message);
      return false;
    }
  }, [subscription]);

  // Testar notificação localmente
  const testLocalNotification = useCallback(() => {
    if (Notification.permission === 'granted') {
      new Notification('Teste de Notificação', {
        body: 'Esta é uma notificação de teste!',
        icon: '/logo192.png',
        badge: '/badge72.png'
      });
    } else {
      alert('Permissão de notificação necessária!');
    }
  }, []);

  return {
    isSupported,
    subscription,
    permission,
    loading,
    error,
    subscribeToPush,
    unsubscribe,
    testLocalNotification,
    registerServiceWorker
  };
}

// Utilitário para converter chave VAPID de base64 para Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
