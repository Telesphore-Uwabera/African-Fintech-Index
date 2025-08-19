import { promises as dns } from 'dns';

/**
 * Best-effort deliverability check:
 * - Validates format
 * - Verifies domain has MX records (or at least resolves)
 *
 * NOTE: This cannot guarantee a specific mailbox exists (SMTP VRFY is often blocked),
 * but it prevents obvious typos and non-receivable domains.
 */
export async function checkEmailDeliverability(email: string): Promise<{ isValid: boolean; reason?: string }>{
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: 'Invalid email format' };
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { isValid: false, reason: 'Missing email domain' };
  }

  // Cap DNS checks with a short timeout to avoid hanging requests
  const TIMEOUT_MS = 8000;
  const KNOWN_PROVIDER_DOMAINS = new Set([
    'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
    'yahoo.com', 'ymail.com', 'rocketmail.com', 'icloud.com', 'me.com', 'mac.com',
    'proton.me', 'protonmail.com', 'zoho.com', 'aol.com'
  ]);
  if (KNOWN_PROVIDER_DOMAINS.has(domain)) {
    return { isValid: true };
  }
  function withTimeout<T>(p: Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('DNS timeout')), TIMEOUT_MS);
      p.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
    });
  }

  try {
    // Prefer MX records
    const mxRecords = await withTimeout(dns.resolveMx(domain));
    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      return { isValid: true };
    }
  } catch (e) {
    // Continue to fallbacks
  }

  // If no MX or MX failed, try resolving A/AAAA via dns.lookup (OS resolver) first
  try {
    const lookedUp = await withTimeout(dns.lookup(domain, { all: true } as any));
    if (Array.isArray(lookedUp) && lookedUp.length > 0) {
      return { isValid: true };
    }
  } catch (e) {
    // Continue to next fallback
  }

  try {
    const aOrAaaa = await withTimeout(dns.resolve(domain));
    if (Array.isArray(aOrAaaa) && aOrAaaa.length > 0) {
      return { isValid: true };
    }
  } catch (e) {
    // ignore
  }

  return { isValid: false, reason: 'Domain could not be verified (no MX/A records or DNS blocked)' };
}


