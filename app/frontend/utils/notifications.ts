type BreakNotification = { tag: string; title: string; body: string };

const isSupported = () => typeof Notification !== "undefined";

// Browsers only show this prompt after a user gesture, so call this from a click.
export const requestNotificationPermission = () => {
  if (isSupported() && Notification.permission === "default") void Notification.requestPermission();
};

// requireInteraction keeps it up until dismissed, where the OS allows that.
export const showNotification = ({ tag, title, body }: BreakNotification) => {
  if (!isSupported() || Notification.permission !== "granted") return null;

  const notification = new Notification(title, { tag, body, requireInteraction: true });
  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};
