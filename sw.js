console.log('here');
self.addEventListener('click', function(){
  console.log('clicked');
})

self.addEventListener('push', function(event) {
  var title = 'Record your energy';
  var body = 'We have received a push message.';
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      tag: tag
    })
  );
});
