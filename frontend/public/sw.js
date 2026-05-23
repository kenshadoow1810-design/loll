
const NOTIFICATION_ICON = '/logo192.png';
const NOTIFICATION_BADGE = '/badge72.png';

self.addEventListener('install', (event) => {

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {

  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {

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

self.addEventListener('notificationclick', (event) => {

  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  

  const urlToOpen = event.notification.data?.streamUrl 
    ? event.notification.data.streamUrl
    : '/schedule';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {

        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('message', (event) => {

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
