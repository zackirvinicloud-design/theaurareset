import { useCallback, useEffect, useMemo, useState } from 'react';

export type NotificationSupportState = NotificationPermission | 'unsupported';

const detectIOS = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  const directMatch = /iphone|ipad|ipod/.test(ua);
  const iPadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return directMatch || iPadDesktopMode;
};

const detectStandalone = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const mediaStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mediaStandalone || iosStandalone;
};

export const useNotificationSetup = () => {
  const [permission, setPermission] = useState<NotificationSupportState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    return Notification.permission;
  });

  const [isStandalone, setIsStandalone] = useState<boolean>(() => detectStandalone());

  const isIOS = useMemo(() => detectIOS(), []);
  const isSupported = permission !== 'unsupported';
  const needsIosInstall = isIOS && !isStandalone;
  const canRequestPermission = isSupported && !needsIosInstall;
  const isEnabled = permission === 'granted';

  const refresh = useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      setIsStandalone(false);
      return;
    }

    setPermission(Notification.permission);
    setIsStandalone(detectStandalone());
  }, []);

  const requestPermission = useCallback(async () => {
    if (!canRequestPermission) {
      return permission;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    return nextPermission;
  }, [canRequestPermission, permission]);

  useEffect(() => {
    refresh();

    if (typeof window === 'undefined') {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refresh]);

  return {
    permission,
    isSupported,
    isIOS,
    isStandalone,
    isEnabled,
    needsIosInstall,
    canRequestPermission,
    requestPermission,
    refresh,
  };
};
