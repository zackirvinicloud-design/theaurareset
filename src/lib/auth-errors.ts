const networkErrorPhrases = [
  'failed to fetch',
  'networkerror',
  'fetch failed',
  'load failed',
  'network request failed',
];

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return '';
};

export const isLikelyNetworkAuthError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  return networkErrorPhrases.some((phrase) => message.includes(phrase));
};

export const getFriendlyAuthErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong while signing in. Please try again.',
) => {
  const raw = getErrorMessage(error).trim();

  if (isLikelyNetworkAuthError(error)) {
    return 'Could not reach the login service. Check your connection, disable VPN/ad blocker, and try again.';
  }

  return raw || fallback;
};
