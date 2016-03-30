self.addEventListener('click', function(){
  console.log('clicked');
})

self.addEventListener('push', function(event) {
  var title = 'Record your energy';
  var body = '<a href="/levels">record</a>';
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      tag: tag
    })
  );
});
