function sendNotification(title, body) {
    new Notification(title, { body });
  }
  
  module.exports = { sendNotification };
  