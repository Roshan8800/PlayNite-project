
import { Workbox } from 'workbox-window';

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');

  wb.addEventListener('installed', (event) => {
    if (event.isUpdate) {
      console.log('Service Worker updated. New content is available.');
      // Optionally show a notification to the user
      if (confirm('New content is available. Reload to get the latest version?')) {
        window.location.reload();
      }
    }
  });

  wb.addEventListener('activated', (event) => {
    if (!event.isExternal) {
      console.log('Service Worker activated for the first time.');
    }
  });

  wb.addEventListener('waiting', (event) => {
    console.log('Service Worker is waiting to activate.');
  });

  wb.register().then((registration) => {
    console.log('Service Worker registered successfully:', registration.scope);

    // Request background sync permission for analytics
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      registration.sync.register('analytics-sync').catch((error) => {
        console.log('Background sync not supported or failed to register:', error);
      });
    }
  }).catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}
