import { QrTestingState, SandboxState } from '../types/sandbox';

export function getVerifiedRequirementsCount(arg?: QrTestingState | SandboxState | any): number {
  if (!arg) return 0;

  const testingState: QrTestingState | undefined =
    arg.testingState || (arg.latestGenerateQrEndpoint || arg.currencySupport ? arg : undefined);
  if (!testingState) return 0;

  let count = 0;
  if (testingState.latestGenerateQrEndpoint?.status === 'verified') count++;
  if (testingState.lifetimeParameter?.status === 'verified') count++;
  if (testingState.checkTransactionFallback?.status === 'verified') count++;
  if (testingState.qrImageTemplate?.status === 'verified') count++;
  if (testingState.currencySupport?.status === 'verified') count++;

  return count;
}

export function isTechnicalTestingComplete(arg?: SandboxState | QrTestingState | any): boolean {
  if (!arg) return false;
  return getVerifiedRequirementsCount(arg) === 5;
}

export function isUiEvidenceComplete(state?: SandboxState | any): boolean {
  if (!state || !state.uiEvidence) return false;
  return Boolean(state.uiEvidence.recordingAttached && state.uiEvidence.screenshotAttached);
}

export function getUiEvidenceAttachedCount(state?: SandboxState | any): number {
  if (!state || !state.uiEvidence) return 0;
  let count = 0;
  if (state.uiEvidence.recordingAttached) count++;
  if (state.uiEvidence.screenshotAttached) count++;
  return count;
}

export function isReadyForProduction(state?: SandboxState | any): boolean {
  return isTechnicalTestingComplete(state) && isUiEvidenceComplete(state);
}

