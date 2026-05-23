import { useEffect, useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSupport = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsSupported(false);
        setError('Seu navegador não suporta notificações push');
        setLoading(false);
        return;
      }

      setIsSupported(true);

      setPermission(Notification.permission);

      try {
        await loadSubscription();
      } catch (err) {

        setError(err.message);
        setLoading(false);
      }
    };

    checkSupport();
  }, []);

  const loadSubscription = async () => {
    try {

      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao carregar service worker')), 5000)
        )
      ]);
      
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);

      }
    } catch (err) {

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      return registration;
    } catch (err) {

      setError(err.message);
      throw err;
    }
  }, [isSupported]);

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

  const getVapidPublicKey = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/vapid-public-key`);
      
      if (!response.ok) {
        throw new Error('Falha ao obter chave VAPID');
      }
      
      const data = await response.json();
      return data.publicKey;
    } catch (err) {

      setError(err.message);
      throw err;
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications não são suportadas');
    }

    try {

      const registration = await registerServiceWorker();
      

      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Permissão negada');
      }

      const vapidPublicKey = await getVapidPublicKey();
      
      if (!vapidPublicKey) {
        throw new Error('Chave VAPID não disponível');
      }

      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      await sendSubscriptionToBackend(newSubscription);
      
      setSubscription(newSubscription);
      return newSubscription;
    } catch (err) {

      setError(err.message);
      throw err;
    }
  }, [isSupported, registerServiceWorker, requestPermission, getVapidPublicKey]);

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

      return result;
    } catch (err) {

      throw err;
    }
  };

  const unsubscribe = useCallback(async () => {
    if (!subscription) return true;

    try {
      const unsubscribed = await subscription.unsubscribe();
      
      if (unsubscribed) {
        setSubscription(null);

      }
      
      return unsubscribed;
    } catch (err) {

      setError(err.message);
      return false;
    }
  }, [subscription]);

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
