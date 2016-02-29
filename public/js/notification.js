Notification.requestPermission();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(function(reg) {
    if(reg.installing) {
      console.log('Service worker installing');
    } else if(reg.waiting) {
      console.log('Service worker installed');
    } else if(reg.active) {
      console.log('Service worker active');
    }
  });
  subscribe();
} else {
  console.log('Service workers aren\'t supported in this browser.');  
}
function subscribe() {
    console.log('before subscribe');
    navigator.serviceWorker.ready.then(function(reg) {
      reg.pushManager.subscribe({userVisibleOnly: true})
        .then(function(subscription) {
          isPushEnabled = true;
          var endpoint = subscription.endpoint;
          var key = subscription.getKey('p256dh');
          updateStatus(endpoint,key,'subscribe');
        })
        .catch(function(e) {
          if (Notification.permission === 'denied') {
            console.log('Permission for Notifications was denied');
          } else {
            console.log('Unable to subscribe to push.', e);
          }
        });
    });
}
