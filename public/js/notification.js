var registrationToken;
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
    navigator.serviceWorker.ready.then(function(reg) {
      reg.pushManager.subscribe({userVisibleOnly: true})
        .then(function(subscription) {
          isPushEnabled = true;
          var endpoint = subscription.endpoint;
          endpointParts = endpoint.split('/')
          registrationId = endpointParts[endpointParts.length - 1]
          registrationToken = registrationId;
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

function unsubscribe() {
navigator.serviceWorker.ready.then(function(reg) {
 reg.pushManager.subscribe({userVisibleOnly: true})
  .then(function(subscription) { subscription.unsubscribe()})})
}

function sendNotification() {
  fetch('levels/message', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({registrationToken: registrationToken})
  })
    .then(function(res) {
      return res.json();
    })
    .catch(function(err){
      console.log('err');
      console.log(err)
    })
}
