// Firebase Messaging Service Worker
// Deve ficar na raiz do domínio para receber push em background
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDG-3F47eWeHdYTbtOT4Ead9E24ijV_to8',
  authDomain: 'portfolio-74e9c.firebaseapp.com',
  projectId: 'portfolio-74e9c',
  storageBucket: 'portfolio-74e9c.firebasestorage.app',
  messagingSenderId: '932685177500',
  appId: '1:932685177500:web:d2d4a4904ec24cbffb8359',
});

const messaging = firebase.messaging();

// Exibe notificação quando o app está em background/fechado
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? '💬 Nova mensagem';
  const body  = payload.notification?.body  ?? '';
  const link  = payload.fcmOptions?.link ?? 'https://egdsdev.github.io/portfolio/admin';

  self.registration.showNotification(title, {
    body,
    icon:  'https://egdsdev.github.io/portfolio/favicon.svg',
    badge: 'https://egdsdev.github.io/portfolio/favicon.svg',
    data:  { link },
    requireInteraction: true,
  });
});

// Ao clicar na notificação, abre o painel admin
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link ?? 'https://egdsdev.github.io/portfolio/admin';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) return client.focus();
      }
      return clients.openWindow(link);
    })
  );
});
