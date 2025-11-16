/**
 * Triggers haptic feedback on supported mobile devices
 * @param style - The type of haptic feedback ('light', 'medium', 'heavy')
 */
export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  // Check if the device supports vibration
  if (!navigator.vibrate) return;

  // Different vibration patterns for different styles
  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30,
  };

  navigator.vibrate(patterns[style]);
};
