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
          console.log(subscription.toJSON());
          var endpoint = subscription.endpoint;
          endpointParts = endpoint.split('/')
          registrationId = endpointParts[endpointParts.length - 1]
          console.log(endpoint);
          console.log(registrationId)
          window.setTimeout(()=>{
            var request = new XMLHttpRequest();

            request.open('POST', 'https://android.googleapis.com/gcm/send');
            request.setRequestHeader('Content-Type', 'application/json');

            var messageObj = {
                                statusType: 'chatMsg',
                                name: 'test',
                                msg: 'test',
                                endpoint: endpoint,
                                registrationIds: [
                                  registrationId
                                ]
                              }
            console.log('here')
            console.log(messageObj);
            request.send(JSON.stringify(messageObj));
          },1000)
          //updateStatus(endpoint,key,'subscribe');
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
