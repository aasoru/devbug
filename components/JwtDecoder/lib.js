export const base64UrlDecode = (str) => {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  try {
    return JSON.parse(decodeURIComponent(atob(padded).split('').map(
      (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')));
  } catch {
    return null;
  }
};

export const decodeToken = (token) => {
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
  const header = base64UrlDecode(parts[0]);
  const payload = base64UrlDecode(parts[1]);
  if (!header || !payload) return null;
  return { header, payload, signature: parts[2] };
};
