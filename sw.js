console.log('here');
self.addEventListener('click', function(){
  console.log('clicked');
})

self.addEventListener('push', function(event) {
  var obj = event.data.json();

  if(obj.action === 'subscribe' || obj.action === 'unsubscribe') {
      fireNotification(obj, event);
      port.postMessage(obj);
    } else if(obj.action === 'init' || obj.action === 'chatMsg') {
        port.postMessage(obj);
      } 
});
