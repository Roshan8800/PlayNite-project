/**
 * Comprehensive cookie management utilities for client-side operations
 * Provides secure, typed cookie handling with advanced features
 */

export interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
}

export interface CookieData {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Set a cookie with advanced options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    if (typeof options.expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    } else {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
  }

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += '; secure';
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  const cookies: Record<string, string> = {};
  const cookieArray = document.cookie.split(';');

  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    const [name, ...valueParts] = cookie.split('=');
    if (name) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(valueParts.join('='));
    }
  }

  return cookies;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  if (typeof document === 'undefined') return;

  setCookie(name, '', {
    ...options,
    expires: new Date(0),
    maxAge: 0,
  });
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Set multiple cookies at once
 */
export function setCookies(cookies: CookieData[]): void {
  cookies.forEach(({ name, value, options }) => {
    setCookie(name, value, options);
  });
}

/**
 * Clear all cookies (use with caution)
 */
export function clearAllCookies(): void {
  if (typeof document === 'undefined') return;

  const cookies = getAllCookies();
  Object.keys(cookies).forEach(name => {
    deleteCookie(name);
  });
}

/**
 * Get cookie expiration date
 */
export function getCookieExpiration(name: string): Date | null {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie.split(';').find(c => c.trim().startsWith(encodeURIComponent(name) + '='));
  if (!cookie) return null;

  const expiresMatch = cookie.match(/expires=([^;]+)/);
  if (expiresMatch) {
    return new Date(expiresMatch[1]);
  }

  return null;
}

/**
 * Check if cookie is expired
 */
export function isCookieExpired(name: string): boolean {
  const expiration = getCookieExpiration(name);
  return expiration ? expiration < new Date() : false;
}

/**
 * Set a session cookie (expires when browser closes)
 */
export function setSessionCookie(name: string, value: string, options: Omit<CookieOptions, 'expires' | 'maxAge'> = {}): void {
  setCookie(name, value, options);
}

/**
 * Set a persistent cookie with expiration
 */
export function setPersistentCookie(name: string, value: string, days: number, options: Omit<CookieOptions, 'expires' | 'maxAge'> = {}): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  setCookie(name, value, { ...options, expires });
}

/**
 * Parse cookie string into object
 */
export function parseCookieString(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  const pairs = cookieString.split(';');

  for (let pair of pairs) {
    pair = pair.trim();
    const [name, ...valueParts] = pair.split('=');
    if (name) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(valueParts.join('='));
    }
  }

  return cookies;
}

/**
 * Serialize cookie object to string
 */
export function serializeCookieObject(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('; ');
}

/**
 * Cookie event listener for changes (limited browser support)
 */
export function onCookieChange(callback: (changes: { name: string; value: string | null; deleted: boolean }[]) => void): () => void {
  if (typeof document === 'undefined') return () => {};

  let lastCookies = getAllCookies();

  const checkChanges = () => {
    const currentCookies = getAllCookies();
    const changes: { name: string; value: string | null; deleted: boolean }[] = [];

    // Check for new or modified cookies
    Object.entries(currentCookies).forEach(([name, value]) => {
      if (!(name in lastCookies) || lastCookies[name] !== value) {
        changes.push({ name, value, deleted: false });
      }
    });

    // Check for deleted cookies
    Object.keys(lastCookies).forEach(name => {
      if (!(name in currentCookies)) {
        changes.push({ name, value: null, deleted: true });
      }
    });

    if (changes.length > 0) {
      callback(changes);
    }

    lastCookies = currentCookies;
  };

  const interval = setInterval(checkChanges, 1000);

  return () => clearInterval(interval);
}

/**
 * Get cookie size in bytes
 */
export function getCookieSize(name: string): number {
  const value = getCookie(name);
  return value ? new Blob([value]).size : 0;
}

/**
 * Get total cookies size
 */
export function getTotalCookiesSize(): number {
  const cookies = getAllCookies();
  return Object.values(cookies).reduce((total, value) => total + new Blob([value]).size, 0);
}

/**
 * Validate cookie name and value
 */
export function isValidCookieName(name: string): boolean {
  // Cookie names cannot contain: = ; , space \t \r \n \f \v
  return /^[^=;, \t\r\n\f\v]+$/.test(name);
}

export function isValidCookieValue(value: string): boolean {
  // Cookie values cannot contain: ; , space \t \r \n \f \v (unless quoted, but we don't handle quotes)
  return /^[^;, \t\r\n\f\v]*$/.test(value);
}

/**
 * Batch cookie operations
 */
export class CookieBatch {
  private operations: Array<() => void> = [];

  set(name: string, value: string, options?: CookieOptions): this {
    this.operations.push(() => setCookie(name, value, options));
    return this;
  }

  delete(name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): this {
    this.operations.push(() => deleteCookie(name, options));
    return this;
  }

  commit(): void {
    this.operations.forEach(op => op());
    this.operations = [];
  }

  rollback(): void {
    this.operations = [];
  }
}

/**
 * Create a new cookie batch
 */
export function createCookieBatch(): CookieBatch {
  return new CookieBatch();
}