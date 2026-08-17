import React from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge, StatusVariant } from '../components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { getVerifiedRequirementsCount, isReadyForProduction } from '../utils/readiness';
import { QrCode, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  const { state, updateState, setRoute, setShowFeedbackModal } = useSandbox();

  const hasStartedIntegration =
    !!state.hasCreatedFirstIntegration ||
    !!state.hasIntegration ||
    (state.qrIntegrationStatus !== 'not_started' && state.qrIntegrationStatus !== undefined);

  const handleStartOrContinue = () => {
    if (!hasStartedIntegration) {
      updateState({
        hasCreatedFirstIntegration: true,
        hasIntegration: true,
        firstTimeUser: false,
        qrIntegrationStatus: state.qrIntegrationStatus === 'not_started' ? 'in_progress' : state.qrIntegrationStatus,
      });
    }

    if (state.reviewStatus === 'submitted' || state.reviewStatus === 'under_review' || state.reviewStatus === 'resubmitted') {
      setRoute('/integrations/qr-api/production');
    } else if (state.reviewStatus === 'changes_requested') {
      setRoute('/integrations/qr-api/production');
      if (setShowFeedbackModal) setShowFeedbackModal(true);
    } else if (state.reviewStatus === 'approved' || state.productionAccessStatus === 'full_production') {
      setRoute('/integrations/qr-api/production');
    } else if (isReadyForProduction(state)) {
      setRoute('/integrations/qr-api/production');
    } else {
      setRoute('/integrations/qr-api');
    }
  };

  // Determine QR API state details
  let qrBadgeLabel = 'Sandbox';
  let qrBadgeVariant: StatusVariant = 'sandbox';
  let qrDescription = 'Generate payment QR codes that customers can scan using ABA Mobile or any supported KHQR banking app.';
  let qrStatusSummary = `${getVerifiedRequirementsCount(state)} of 5 Sandbox requirements verified`;
  let ctaLabel = hasStartedIntegration ? 'Open QR API Workspace' : 'Start Integration';

  if (state.reviewStatus === 'submitted' || state.reviewStatus === 'under_review') {
    qrBadgeLabel = 'Under Review';
    qrBadgeVariant = 'under_review';
    qrDescription = 'Your production access application has been submitted and is currently under review by the PayWay team.';
    qrStatusSummary = 'Application Under Review';
    ctaLabel = 'View Review Status';
  } else if (state.reviewStatus === 'changes_requested') {
    qrBadgeLabel = 'Action Required';
    qrBadgeVariant = 'changes_requested';
    qrDescription = 'PayWay has reviewed your submission and requested additional information or updates.';
    qrStatusSummary = 'Feedback Awaiting Response';
    ctaLabel = 'Review Feedback & Update';
  } else if (state.reviewStatus === 'resubmitted') {
    qrBadgeLabel = 'Resubmitted';
    qrBadgeVariant = 'resubmitted';
    qrDescription = 'Your updated production application has been resubmitted and is under review.';
    qrStatusSummary = 'Updated Application Under Review';
    ctaLabel = 'View Review Status';
  } else if (state.reviewStatus === 'approved' || state.productionAccessStatus === 'full_production') {
    qrBadgeLabel = 'Production Approved';
    qrBadgeVariant = 'approved';
    qrDescription = 'Your QR API production integration is approved. Live credentials have been securely delivered to your registered email.';
    qrStatusSummary = 'Live Production Approved';
    ctaLabel = 'View Production Access';
  } else if (isReadyForProduction(state)) {
    qrBadgeLabel = 'Production Ready';
    qrBadgeVariant = 'active';
    qrDescription = 'All 5 Sandbox testing and evidence requirements are verified. You are ready to apply for live production access.';
    qrStatusSummary = '5 of 5 requirements verified';
    ctaLabel = 'Request Production Access';
  } else if (hasStartedIntegration) {
    qrBadgeLabel = 'In Progress';
    qrBadgeVariant = 'sandbox';
    qrDescription = 'Generate payment QR codes that customers can scan using ABA Mobile or any supported KHQR banking app.';
    qrStatusSummary = `${getVerifiedRequirementsCount(state)} of 5 Sandbox requirements verified`;
    ctaLabel = 'Continue QR API Workspace';
  }

  const verifiedCount = getVerifiedRequirementsCount(state);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {/* Page Header */}
      <PageHeader
        title="Payment Integrations"
        description="Build, test, and manage your PayWay QR API integration."
      />

      {/* Primary QR API Integration Card */}
      <Card className="hover:border-cyan-300 transition-all shadow-2xs border-gray-200">
        <CardHeader
          action={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-md">
                NBC KHQR
              </span>
              <StatusBadge status={qrBadgeVariant} label={qrBadgeLabel} size="sm" />
            </div>
          }
        >
          <CardTitle
            icon={
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#00B4CC]">
                <QrCode className="w-5 h-5" />
              </div>
            }
          >
            QR API
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm mt-1 max-w-2xl leading-relaxed">
            {qrDescription}
          </CardDescription>
        </CardHeader>

        {/* Feature Highlights & Progress */}
        <div className="px-6 py-4 bg-gray-50/70 border-y border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#00B4CC]" />
              <span>Real-time Dynamic KHQR</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#00B4CC]" />
              <span>Instant Webhook Notifications</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#00B4CC]" />
              <span>Merchant Verification</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">
              {qrStatusSummary}
            </span>
          </div>
        </div>

        {/* Progress Bar (if in sandbox / readiness stage) */}
        {state.reviewStatus === 'none' && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>Sandbox Verification Progress</span>
              <span className="font-bold text-gray-800">{verifiedCount}/5 Complete</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B4CC] transition-all duration-500 rounded-full"
                style={{ width: `${(verifiedCount / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        <CardContent className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Supports both USD and KHR currencies with instant push verification.
          </div>

          <button
            onClick={handleStartOrContinue}
            className="text-xs font-semibold px-4 py-2 rounded-lg text-white shadow-2xs transition-all hover:opacity-95 cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto"
            style={{ backgroundColor: '#00B4CC' }}
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
