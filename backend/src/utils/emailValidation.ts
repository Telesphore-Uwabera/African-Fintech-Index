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
  const TIMEOUT_MS = 4000;
  function withTimeout<T>(p: Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('DNS timeout')), TIMEOUT_MS);
      p.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
    });
  }

  try {
    const mxRecords = await withTimeout(dns.resolveMx(domain));
    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      return { isValid: true };
    }
    // If no MX, some domains still accept mail on A record. Fall back to A/AAAA resolution.
    try {
      const aOrAaaa = await withTimeout(dns.resolve(domain));
      if (Array.isArray(aOrAaaa) && aOrAaaa.length > 0) {
        return { isValid: true };
      }
    } catch {
      // ignore and fail below
    }
    return { isValid: false, reason: 'Domain has no MX records' };
  } catch (err) {
    return { isValid: false, reason: err instanceof Error ? err.message : 'DNS resolution failed' };
  }
}


