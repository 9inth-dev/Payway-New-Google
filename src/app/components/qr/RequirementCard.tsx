import React from 'react';
import { RequirementStatus, RequirementDetail, CurrencyRequirementDetail } from '../../types/sandbox';
import { ExternalLink, AlertCircle, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface RequirementCardProps {
  number: number;
  title: string;
  explanation: string;
  detail?: RequirementDetail | CurrencyRequirementDetail;
  status?: RequirementStatus;
  autoVerified?: boolean;
  errorTitle?: string;
  errorMessage?: string;
  actionText?: string;
  actionUrl?: string;
  actionRoute?: string;
  onActionClick?: () => void;
  lastEventTime?: string;
  lastTxId?: string;
  lastDetails?: string;
  
  // Specific to Currency Support (Requirement 5)
  isCurrencySupportRequirement?: boolean;
  testedCurrencies?: ('USD' | 'KHR')[];
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  number,
  title,
  explanation,
  detail,
  status: propStatus,
  autoVerified = true,
  errorTitle: propErrorTitle,
  errorMessage: propErrorMessage,
  actionText: propActionText,
  actionUrl: propActionUrl,
  actionRoute: propActionRoute,
  onActionClick,
  lastEventTime: propLastEventTime,
  lastTxId: propLastTxId,
  lastDetails: propLastDetails,
  isCurrencySupportRequirement,
  testedCurrencies: propTestedCurrencies,
}) => {
  const status: RequirementStatus = detail?.status || propStatus || 'not_detected';
  const errorTitle = detail?.errorTitle || propErrorTitle;
  const errorMessage = detail?.errorMessage || propErrorMessage;
  const actionText = detail?.actionText || propActionText;
  const actionUrl = detail?.actionUrl || propActionUrl;
  const actionRoute = detail?.actionRoute || propActionRoute;
  const lastEventTime = detail?.lastEventTime || propLastEventTime;
  const lastTxId = detail?.lastTxId || propLastTxId;
  const lastDetails = detail?.lastDetails || propLastDetails;

  const testedCurrencies = (detail as CurrencyRequirementDetail)?.testedCurrencies || propTestedCurrencies;
  const isCurrencyRequirement = isCurrencySupportRequirement || testedCurrencies !== undefined;

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            Verified
          </span>
        );
      case 'action_required':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Action required
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-[#00B4CC] border border-cyan-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#00B4CC]" />
            In progress
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
            Failed
          </span>
        );
      case 'not_detected':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            Not detected
          </span>
        );
    }
  };

  const hasError = (status === 'action_required' || status === 'failed') && (errorTitle || errorMessage);
  const hasUsd = testedCurrencies?.includes('USD');
  const hasKhr = testedCurrencies?.includes('KHR');

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all shadow-2xs ${
        status === 'verified'
          ? 'border-emerald-200/80 bg-emerald-50/10'
          : status === 'action_required'
          ? 'border-amber-200/80 bg-amber-50/10'
          : status === 'failed'
          ? 'border-rose-200/80 bg-rose-50/10'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* CARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              status === 'verified'
                ? 'bg-emerald-100 text-emerald-800'
                : status === 'action_required'
                ? 'bg-amber-100 text-amber-800'
                : status === 'failed'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {number}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-800">{title}</h3>
              {autoVerified && (
                <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                  Automatically verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{explanation}</p>
          </div>
        </div>

        <div className="self-start sm:self-center shrink-0">{getStatusBadge()}</div>
      </div>

      {/* CURRENCY REQUIREMENT SUB-STATUS (Requirement 5) */}
      {isCurrencyRequirement && (
        <div className="mt-3.5 p-3 rounded-lg bg-gray-50/90 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Settlement Currencies:
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                  hasUsd
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                <span>USD ($)</span>
                <span>{hasUsd ? '✓' : '○'}</span>
              </span>

              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                  hasKhr
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                <span>KHR (៛)</span>
                <span>{hasKhr ? '✓' : '○'}</span>
              </span>
            </div>
          </div>

          <div className="text-[11px] text-gray-500">
            {hasUsd && hasKhr ? (
              <span className="font-semibold text-emerald-700">Both settlement currencies tested ✓</span>
            ) : hasUsd || hasKhr ? (
              <span className="text-cyan-800 font-medium">Test the remaining supported currency to complete this requirement.</span>
            ) : (
              <span>Not tested yet</span>
            )}
          </div>
        </div>
      )}

      {/* ACTIONABLE ERROR / ATTENTION CALLOUT */}
      {hasError && (
        <div
          className={`mt-3.5 p-3.5 rounded-lg border flex flex-col gap-2 animate-in fade-in duration-150 ${
            status === 'failed'
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {status === 'failed' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              {errorTitle && (
                <h4 className="text-xs font-bold tracking-tight">{errorTitle}</h4>
              )}
              {errorMessage && (
                <p className="text-xs mt-0.5 leading-relaxed opacity-90">{errorMessage}</p>
              )}
            </div>
          </div>

          {(actionText || actionUrl || actionRoute || onActionClick) && (
            <div className="pt-1 pl-6.5 flex items-center gap-2">
              {actionUrl ? (
                <a
                  href={actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4CC] hover:text-[#009cb2] underline transition-colors cursor-pointer"
                >
                  <span>{actionText || 'View documentation'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onActionClick}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#00B4CC] hover:text-[#009cb2] cursor-pointer transition-colors"
                >
                  <span>{actionText || 'Take action'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* RELATED OBSERVED SANDBOX API ACTIVITY */}
      {lastEventTime && !hasError && (
        <div className="mt-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-gray-700">Observed in Sandbox</span>
            {lastTxId && (
              <span className="font-mono text-gray-500 text-[11px]">({lastTxId})</span>
            )}
            {lastDetails && (
              <span className="text-gray-600 text-[11px]">— {lastDetails}</span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 font-mono">{lastEventTime}</span>
        </div>
      )}
    </div>
  );
};
