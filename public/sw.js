// Service Worker for Tusmo School Push Notifications
// Place this file in /public/sw.js

self.addEventListener('push', function(event) {
    if (!event.data) return;

    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = { title: 'Tusmo School', body: event.data.text() };
    }

    const {
        title = 'Tusmo School',
        body = 'Waxaad heeshay ogeysiis cusub',
        url = '/dashboard',
        icon = '/icon-192.png',
        badge = '/icon-192.png',
    } = data;

    const options = {
        body,
        icon,
        badge,
        vibrate: [200, 100, 200],
        data: { url },
        actions: [
            { action: 'open', title: 'Fur', icon: '/icon-192.png' },
            { action: 'close', title: 'Xir' },
        ],
        requireInteraction: false,
        silent: false,
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'close') return;

    const url = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(url);
                    return;
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});
