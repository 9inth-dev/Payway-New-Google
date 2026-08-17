import React from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { ReviewStatus } from '../../types/sandbox';
import { AttentionCard } from './AttentionCard';
import { Check, Mail, ShieldCheck, Building2, Store, CreditCard, Calendar, Clock } from 'lucide-react';

interface ProvisionalProductionDashboardProps {
  onOpenResubmitModal?: () => void;
}

export const ProvisionalProductionDashboard: React.FC<ProvisionalProductionDashboardProps> = ({
  onOpenResubmitModal,
}) => {
  const { state, updateState, addToast, setRoute, setShowFeedbackModal } = useSandbox();

  const isApproved = state.reviewStatus === 'approved' || state.productionAccessStatus === 'full_production';
  const isSubmitted = state.reviewStatus === 'submitted';
  const isUnderReview = state.reviewStatus === 'under_review';
  const isChangesRequested = state.reviewStatus === 'changes_requested';
  const isResubmitted = state.reviewStatus === 'resubmitted';

  const merchantEmail = state.productionMerchantEmail || 'merchant-contact@henrystores.kh';
  const maskedEmail = merchantEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '•••••' + c);

  // Human-readable labels for review status
  const getReviewStatusLabel = (status: ReviewStatus) => {
    switch (status) {
      case 'submitted':
        return 'Request Submitted';
      case 'under_review':
        return 'Under PayWay Review';
      case 'changes_requested':
        return 'Changes Requested';
      case 'resubmitted':
        return 'Resubmitted for Review';
      case 'approved':
        return 'Approved';
      case 'none':
      default:
        return 'Not Submitted';
    }
  };

  // Badge styling for review status
  const getReviewStatusBadgeClass = (status: ReviewStatus) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'under_review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'changes_requested':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'resubmitted':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* HEADER SECTION */}
      <div
        className={`bg-gradient-to-r ${
          isApproved
            ? 'from-gray-900 via-emerald-950 to-slate-900 border-emerald-500/30'
            : isChangesRequested
            ? 'from-amber-950 via-stone-900 to-slate-900 border-amber-500/30'
            : isUnderReview
            ? 'from-purple-950 via-slate-900 to-cyan-950 border-purple-500/30'
            : 'from-gray-900 via-slate-800 to-cyan-950 border-cyan-500/30'
        } text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border`}
      >
        {/* Decorative glow */}
        <div
          className={`absolute top-0 right-0 w-80 h-80 ${
            isApproved
              ? 'bg-emerald-500/10'
              : isChangesRequested
              ? 'bg-amber-500/10'
              : isUnderReview
              ? 'bg-purple-500/10'
              : 'bg-[#00B4CC]/10'
          } rounded-full blur-3xl pointer-events-none`}
        />

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                isApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : isChangesRequested
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : isUnderReview
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              }`}
            >
              {getReviewStatusLabel(state.reviewStatus)}
            </span>

            <span className="text-white/40 text-xs">•</span>

            <span className="text-xs font-medium flex items-center gap-1.5 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  isApproved ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
                }`}
              />
              Sandbox Environment: Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isApproved
              ? 'Production Access Approved'
              : isChangesRequested
              ? 'Changes Requested by PayWay'
              : isUnderReview
              ? 'PayWay Integration Review in Progress'
              : isResubmitted
              ? 'Resubmitted for PayWay Review'
              : 'Production Access Request Submitted'}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            {isApproved
              ? "Your QR API integration has been approved for production. We've sent your production credentials to your registered email address. Check your email for the credentials and instructions you need to start accepting live payments."
              : isChangesRequested
              ? 'The PayWay Integration Team evaluated your submission and requested minor updates before granting production access.'
              : 'PayWay usually reviews requests within 2 to 3 working days. Your sandbox testing environment remains active and fully functional during review.'}
          </p>
        </div>
      </div>

      {/* ATTENTION CARD (When PayWay requests changes) */}
      {isChangesRequested && (
        <AttentionCard
          onOpenModal={() => {
            if (onOpenResubmitModal) {
              onOpenResubmitModal();
            } else {
              setShowFeedbackModal(true);
            }
          }}
        />
      )}

      {/* REVIEW TIMELINE & STATUS TRACKER */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-900">Application Review Process</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              PayWay evaluates technical implementation and business details before issuing live API credentials.
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getReviewStatusBadgeClass(
              state.reviewStatus
            )}`}
          >
            {getReviewStatusLabel(state.reviewStatus)}
          </span>
        </div>

        {/* 4-STEP TIMELINE TRACKER */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Step 1: Submission */}
          <div
            className={`p-4 rounded-xl border text-xs flex flex-col gap-1.5 ${
              isSubmitted || isUnderReview || isChangesRequested || isResubmitted || isApproved
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-800">
                1. Submitted
              </span>
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                ✓
              </span>
            </div>
            <div className="text-xs font-semibold text-gray-900">Request Sent</div>
            <p className="text-[11px] text-gray-500 leading-normal">
              Queued for PayWay Integration Team review.
            </p>
          </div>

          {/* Step 2: Under Review */}
          <div
            className={`p-4 rounded-xl border text-xs flex flex-col gap-1.5 ${
              isApproved || isResubmitted
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : isUnderReview
                ? 'bg-purple-50/80 border-purple-300 text-purple-950 shadow-2xs'
                : isChangesRequested
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider text-purple-800">
                2. Evaluation
              </span>
              <span
                className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center ${
                  isApproved || isResubmitted
                    ? 'bg-emerald-600 text-white'
                    : isUnderReview
                    ? 'bg-purple-600 text-white animate-pulse'
                    : isChangesRequested
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isApproved || isResubmitted ? '✓' : '2'}
              </span>
            </div>
            <div className="text-xs font-semibold text-gray-900">
              {isUnderReview
                ? 'Under Active Review'
                : isChangesRequested
                ? 'Changes Requested'
                : isResubmitted
                ? 'Resubmitted'
                : 'Pending Review'}
            </div>
            <p className="text-[11px] text-gray-500 leading-normal">
              PayWay evaluates code, evidence &amp; merchant details.
            </p>
          </div>

          {/* Step 3: Decision */}
          <div
            className={`p-4 rounded-xl border text-xs flex flex-col gap-1.5 ${
              isApproved
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : isChangesRequested
                ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-2xs'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider text-gray-700">
                3. Decision
              </span>
              <span
                className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center ${
                  isApproved
                    ? 'bg-emerald-600 text-white'
                    : isChangesRequested
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isApproved ? '✓' : isChangesRequested ? '!' : '3'}
              </span>
            </div>
            <div className="text-xs font-semibold text-gray-900">
              {isApproved
                ? 'Approved'
                : isChangesRequested
                ? 'Action Required'
                : 'Awaiting Decision'}
            </div>
            <p className="text-[11px] text-gray-500 leading-normal">
              {isChangesRequested
                ? 'Review feedback and resubmit when ready.'
                : 'PayWay approval decision issued within 2-3 working days.'}
            </p>
          </div>

          {/* Step 4: Credential Delivery */}
          <div
            className={`p-4 rounded-xl border text-xs flex flex-col gap-1.5 ${
              isApproved
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider text-gray-700">
                4. Credential Delivery
              </span>
              <span
                className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center ${
                  isApproved ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isApproved ? '✓' : '✉️'}
              </span>
            </div>
            <div className="text-xs font-semibold text-gray-900">
              {isApproved ? 'Credentials Delivered' : 'Pending Approval'}
            </div>
            <p className="text-[11px] text-gray-500 leading-normal">
              {isApproved
                ? 'Sent to registered email address.'
                : 'Sent by email upon approval.'}
            </p>
          </div>
        </div>

        {/* SANDBOX CONTINUITY BANNER */}
        <div className="p-4 bg-cyan-50/60 border border-cyan-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-cyan-950">
          <div className="flex items-start gap-2.5">
            <span className="text-base leading-none">⚙️</span>
            <div>
              <strong className="font-bold text-cyan-900 block">
                Sandbox mode remains active during review
              </strong>
              <span className="text-[11px] text-cyan-800">
                You can continue testing payment generation, webhooks, and UI integration in your sandbox workspace without interruption.
              </span>
            </div>
          </div>

          <button
            onClick={() => setRoute('/integrations/qr-api/testing')}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#00B4CC] text-white hover:bg-[#009cb2] rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs"
          >
            Continue Sandbox Testing →
          </button>
        </div>
      </div>

      {/* PRODUCTION CREDENTIALS & DELIVERY STATUS SECTION */}
      {isApproved ? (
        <div className="bg-white rounded-xl border border-emerald-200 p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900">Approved Production Information</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Your QR API credentials and live activation package were delivered to your registered email.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Credentials Sent by Email
            </span>
          </div>

          {/* Details Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 flex flex-col gap-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">Approved Business</span>
                  <span className="font-bold text-gray-900 text-xs">
                    {state.productionMerchantName || 'Henry Stores Co., Ltd.'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">Approved Outlet</span>
                  <span className="font-bold text-gray-900 text-xs">
                    {state.productionOutletName || 'Main Flagship Branch (Phnom Penh)'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">Payment Methods</span>
                  <span className="font-bold text-gray-900 text-xs">
                    KHQR, ABA PAY
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">Approval Date</span>
                  <span className="font-bold text-gray-900 text-xs">
                    {state.productionCredentialsSentAt?.split(',')[0] || '17 Aug 2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* Credential Delivery Box */}
            <div className="mt-2 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="font-bold text-emerald-950 block text-xs">
                    Live production credentials dispatched
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Delivered to: <strong className="font-semibold text-emerald-950 font-mono">{maskedEmail}</strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium shrink-0">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{state.productionCredentialsSentAt || '17 Aug 2026, 9:24 AM'}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-xl text-xs text-cyan-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Security Policy:</strong> For security reasons, live production keys and merchant secrets are delivered exclusively via encrypted email to authorized account holders and are not displayed inside Sandbox.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50/80 rounded-xl border border-gray-200 p-6 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">✉️</span>
              <h3 className="text-sm font-bold text-gray-800">Production Credentials</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-600 uppercase tracking-wider">
              Pending Approval
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Production credentials will be sent to your registered email address upon approval and are not displayed in Sandbox.
          </p>

          <div className="bg-gray-100 rounded-lg p-3.5 text-xs text-gray-500 flex items-center justify-between border border-gray-200">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>Email delivery queued upon PayWay approval</span>
            </div>
            <span className="text-[10px] font-sans font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
              Locked
            </span>
          </div>
        </div>
      )}

      {/* STAKEHOLDER DEMONSTRATION CONTROLS */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
              🧪
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-tight">
                Review State Machine Controls (Stakeholder Prototype)
              </h4>
              <p className="text-[11px] text-slate-400">
                Simulate PayWay Integration Team review outcomes in real-time.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
            Internal Prototype
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'submitted', label: '1. Request Submitted', color: 'bg-blue-600 hover:bg-blue-500' },
            { id: 'under_review', label: '2. Under Review', color: 'bg-purple-600 hover:bg-purple-500' },
            { id: 'changes_requested', label: '3. Changes Requested', color: 'bg-amber-600 hover:bg-amber-500' },
            { id: 'resubmitted', label: '4. Resubmitted', color: 'bg-cyan-600 hover:bg-cyan-500' },
            { id: 'approved', label: '5. Approved (Credentials Sent by Email)', color: 'bg-emerald-600 hover:bg-emerald-500' },
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                const isApp = preset.id === 'approved';
                updateState({
                  reviewStatus: preset.id as ReviewStatus,
                  productionAccessStatus: isApp ? 'full_production' : 'pending_review',
                  productionCredentialsDeliveryStatus: isApp ? 'sent' : 'pending',
                  ...(isApp
                    ? {
                        productionCredentialsSentAt: '17 Aug 2026, 9:24 AM',
                        productionMerchantEmail: 'merchant-contact@henrystores.kh',
                        productionApiKey: undefined,
                      }
                    : {}),
                });
                addToast(
                  'Review Status Updated',
                  isApp
                    ? 'Production access approved — credentials sent by email'
                    : `Simulated state: ${getReviewStatusLabel(preset.id as any)}`,
                  'info'
                );
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer transition-all ${preset.color} ${
                state.reviewStatus === preset.id ? 'ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
