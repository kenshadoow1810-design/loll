// Service Worker para Web Push Notifications
const NOTIFICATION_ICON = '/logo192.png';
const NOTIFICATION_BADGE = '/badge72.png';

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting(); // Ativar imediatamente
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(self.clients.claim()); // Controlar todas as páginas abertas
});

// Lidar com notificações push recebidas
self.addEventListener('push', (event) => {
  console.log('[SW] Notificação push recebida');
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Nova notificação',
        body: event.data.text(),
      };
    }
  }
  
  const options = {
    body: data.body || 'Você tem uma nova notificação',
    icon: data.icon || NOTIFICATION_ICON,
    badge: data.badge || NOTIFICATION_BADGE,
    vibrate: [100, 50, 100],
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: [
      {
        action: 'open',
        title: 'Ver Partida',
        icon: '/icons/play.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Calendário de Partidas', options)
  );
});

// Lidar com cliques na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // URL para abrir quando clicar na notificação
  const urlToOpen = event.notification.data?.streamUrl 
    ? event.notification.data.streamUrl
    : '/schedule';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Verificar se já existe uma aba aberta com a URL
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Abrir nova aba se não existir
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Lidar com mensagens do frontend
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
