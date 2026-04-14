const PUSH_SERVICE_WORKER_PATH = '/push-sw.js';

const toUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const canUseWebPush = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
  );
};

export const ensurePushServiceWorker = async () => {
  if (!canUseWebPush()) {
    throw new Error('This browser does not support web push notifications.');
  }

  const existingRegistration = await navigator.serviceWorker.getRegistration(PUSH_SERVICE_WORKER_PATH);
  if (existingRegistration) {
    return existingRegistration;
  }

  return navigator.serviceWorker.register(PUSH_SERVICE_WORKER_PATH);
};

export const ensurePushSubscription = async (vapidPublicKey: string) => {
  if (!vapidPublicKey.trim()) {
    throw new Error('Missing VAPID public key.');
  }

  const registration = await ensurePushServiceWorker();
  const readyRegistration = await navigator.serviceWorker.ready;
  const pushManager = readyRegistration?.pushManager ?? registration.pushManager;

  const existingSubscription = await pushManager.getSubscription();
  if (existingSubscription) {
    return existingSubscription.toJSON();
  }

  const nextSubscription = await pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: toUint8Array(vapidPublicKey),
  });

  return nextSubscription.toJSON();
};
