import { SandboxState } from '../types/sandbox';

export type SandboxCredentialStatus = 'active' | 'expiring_soon' | 'expired' | 'extension_requested';

export const SANDBOX_LIFETIME_MONTHS = 3;
export const SANDBOX_WARNING_DAYS = 14;

export function addCalendarMonths(date: Date, months: number) {
  const next = new Date(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

export function createSandboxLifecycle(now = new Date()) {
  return { activatedAt: now.toISOString(), expiresAt: addCalendarMonths(now, SANDBOX_LIFETIME_MONTHS).toISOString() };
}

export function getSandboxCredentialStatus(state: Pick<SandboxState, 'expiresAt' | 'extensionRequestedAt'>, now = new Date()): SandboxCredentialStatus {
  if (state.extensionRequestedAt && new Date(state.extensionRequestedAt) <= now) return 'extension_requested';
  const expiresAt = new Date(state.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) return 'active';
  if (expiresAt.getTime() <= now.getTime()) return 'expired';
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000);
  return daysRemaining <= SANDBOX_WARNING_DAYS ? 'expiring_soon' : 'active';
}

export function getSandboxDaysRemaining(expiresAt: string, now = new Date()) {
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires)) return null;
  return Math.ceil((expires - now.getTime()) / 86400000);
}

export function formatSandboxDate(value?: string) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getSandboxAccessMessage(status: SandboxCredentialStatus) {
  if (status === 'expired') return 'Your Sandbox credentials expired. Request an extension to continue testing.';
  if (status === 'extension_requested') return 'Your extension request is pending approval. Sandbox calls remain blocked until approval.';
  if (status === 'expiring_soon') return 'Your Sandbox credentials are expiring soon.';
  return 'Sandbox credentials are active.';
}
