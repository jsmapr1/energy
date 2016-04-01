self.addEventListener('push', function(event) {
  var title = 'Record your energy';
  var body = 'Record Now';
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      tag: tag
    })
  );
});
