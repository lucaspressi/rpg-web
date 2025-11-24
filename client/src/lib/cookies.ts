export function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieString) return cookies;
  
  cookieString.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    const trimmedName = name?.trim();
    const value = rest.join('=').trim();
    
    if (trimmedName) {
      cookies[trimmedName] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}
