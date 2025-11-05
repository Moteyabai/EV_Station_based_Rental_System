// Utility helpers for token storage and retrieval
const TOKEN_KEY = 'ev_token';
const LEGACY_TOKEN_KEY = 'token';

export function getToken() {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem(LEGACY_TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(LEGACY_TOKEN_KEY) ||
      null
    );
  } catch (e) {
    return null;
  }
}

export function setToken(token, remember = true) {
  try {
    // clear previous
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);

    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {
    // ignore
  }
}

export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch (e) {
    // ignore
  }
}
