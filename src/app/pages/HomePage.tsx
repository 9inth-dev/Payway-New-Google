import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { CredentialCard } from '../components/common/CredentialCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { StatusBadge, StatusVariant } from '../components/common/StatusBadge';
import { getVerifiedRequirementsCount, getUiEvidenceAttachedCount, isTechnicalTestingComplete, isUiEvidenceComplete } from '../utils/readiness';
import { AttentionCard } from '../components/qr/AttentionCard';
import { QrCode, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    state,
    setRoute,
    setShowCreateTxModal,
    transactions,
    apiLogs,
    setSelectedActivityLogId,
    addToast,
  } = useSandbox();

  const hasIntegration = !!state.hasCreatedFirstIntegration || !!state.hasIntegration;
  const isFirstTime = !!state.firstTimeUser;
  const displayLogs = isFirstTime ? [] : (apiLogs || []);

  const verifiedCount = getVerifiedRequirementsCount(state);
  const evidenceCount = getUiEvidenceAttachedCount(state);
  const technicalComplete = isTechnicalTestingComplete(state);
  const evidenceComplete = isUiEvidenceComplete(state);
  const isLive = state.productionAccessStatus === 'live' || state.productionAccessStatus === 'full_production';
  const isApproved = state.productionAccessStatus === 'approved' || state.reviewStatus === 'approved';
  const hasProductionApplication = state.productionAccessStatus !== 'sandbox' || state.reviewStatus !== 'none';
  const latestTx = !isFirstTime && transactions && transactions.length > 0 ? transactions[0] : null;
  const latestActivity = !isFirstTime && displayLogs.length > 0 ? displayLogs[0] : null;

  let qrStage = 'Technical Testing';
  let qrProgressLabel = 'TECHNICAL TESTING';
  let qrProgressValue = `${verifiedCount} of 5 verified`;
  let qrStatusLabel = 'Sandbox Testing';
  let qrCtaLabel = 'Continue testing';
  let qrCtaRoute = '/integrations/qr-api/testing';
  let qrStatusVariant: StatusVariant = 'testing';

  if (isLive) {
    qrStage = 'Live'; qrProgressLabel = 'PRODUCTION ACCESS'; qrProgressValue = 'Live'; qrStatusLabel = 'Live'; qrCtaLabel = 'View integration'; qrCtaRoute = '/integrations/qr-api/production'; qrStatusVariant = 'live';
  } else if (isApproved) {
    qrStage = 'Production Approved'; qrProgressLabel = 'PRODUCTION ACCESS'; qrProgressValue = 'Approved'; qrStatusLabel = 'Production Approved'; qrCtaLabel = 'View integration'; qrCtaRoute = '/integrations/qr-api/production'; qrStatusVariant = 'approved';
  } else if (state.reviewStatus === 'changes_requested' || state.productionAccessStatus === 'changes_requested') {
    qrStage = 'Changes Requested'; qrProgressLabel = 'PRODUCTION REVIEW'; qrProgressValue = 'Changes requested'; qrStatusLabel = 'Changes Requested'; qrCtaLabel = 'Review feedback'; qrCtaRoute = '/integrations/qr-api/production'; qrStatusVariant = 'changes_requested';
  } else if (state.reviewStatus === 'submitted' || state.reviewStatus === 'under_review' || state.reviewStatus === 'resubmitted' || state.productionAccessStatus === 'submitted' || state.productionAccessStatus === 'under_review' || state.productionAccessStatus === 'resubmitted') {
    qrStage = 'Under Review'; qrProgressLabel = 'PRODUCTION REVIEW'; qrProgressValue = state.reviewStatus === 'submitted' || state.productionAccessStatus === 'submitted' ? 'Submitted' : 'Under review'; qrStatusLabel = 'Under Review'; qrCtaLabel = 'View review status'; qrCtaRoute = '/integrations/qr-api/production'; qrStatusVariant = state.reviewStatus === 'resubmitted' ? 'resubmitted' : 'under_review';
  } else if (hasProductionApplication) {
    qrStage = 'Production Application'; qrProgressLabel = 'PRODUCTION APPLICATION'; qrProgressValue = 'In progress'; qrStatusLabel = 'Application in Progress'; qrCtaLabel = 'Continue application'; qrCtaRoute = '/integrations/qr-api/production'; qrStatusVariant = 'in_progress';
  } else if (technicalComplete && evidenceComplete) {
    qrStage = 'Ready for Production Access'; qrProgressLabel = 'PRODUCTION READINESS'; qrProgressValue = 'Ready to request access'; qrStatusLabel = 'Production Ready'; qrCtaLabel = 'Request production access'; qrCtaRoute = '/integrations/qr-api/production'; qrStatusVariant = 'active';
  } else if (technicalComplete) {
    qrStage = 'UI Evidence'; qrProgressLabel = 'UI EVIDENCE'; qrProgressValue = `${evidenceCount} of 2 uploaded`; qrStatusLabel = 'Evidence Required'; qrCtaLabel = 'Upload UI evidence'; qrCtaRoute = '/integrations/qr-api/production'; qrStatusVariant = 'pending';
  }

  const lastActivityLabel = latestActivity
    ? latestActivity.result || latestActivity.endpoint
    : latestTx ? `Test payment completed (${latestTx.currency} ${latestTx.amount.toFixed(2)})` : 'No activity yet';

  if (isFirstTime) {
    return <FirstTimeDashboard state={state} setRoute={setRoute} addToast={addToast} />;
  }

  const developerTools = [
    {
      title: 'API Documentation',
      desc: 'View API specs & endpoint details',
      icon: (
        <svg width="18" height="18" fill="none" stroke="#00B4CC" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      bg: '#E6F8FA',
      onClick: () => setRoute('/developer/docs'),
    },
    {
      title: 'Payment Simulator',
      desc: 'Run sandbox payment calls',
      icon: (
        <svg width="18" height="18" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      bg: '#FFFBEB',
      onClick: () => setShowCreateTxModal(true),
    },
    {
      title: 'Sample Code',
      desc: 'cURL, Node.js, PHP & Python',
      icon: (
        <svg width="18" height="18" fill="none" stroke="#8B5CF6" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      bg: '#F3F0FF',
      onClick: () => setRoute('/developer/docs'),
    },
    {
      title: 'Transactions',
      desc: 'Inspect request logs & webhooks',
      icon: (
        <svg width="18" height="18" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      bg: '#ECFDF5',
      onClick: () => setRoute('/transactions'),
    },
  ];

  return (
    <div className="flex flex-col gap-7 w-full pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0D3D4F' }}>
            Welcome to PayWay Sandbox, <span style={{ color: '#00B4CC' }}>Henry</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Build and test PayWay integrations safely before accepting live payments.
          </p>
        </div>
      </div>

      {/* Attention Card (If changes requested by ABA PayWay review) */}
      <AttentionCard className="mb-0" />

      {/* ================= SECTION 1: DEVELOPER TOOLS ================= */}
      <div data-tour="developer-tools">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Developer Tools
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {developerTools.map(tool => (
            <button
              key={tool.title}
              onClick={tool.onClick}
              className="bg-white rounded-xl border border-gray-100 shadow-2xs p-4 text-left flex items-center gap-3.5 hover:shadow-md hover:border-cyan-100 transition-all cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: tool.bg }}
              >
                {tool.icon}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-800">{tool.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{tool.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ================= SECTION 2: SANDBOX CREDENTIALS ================= */}
      <div data-tour="credentials">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Sandbox Credentials
        </div>
        <CredentialCard
          title="Sandbox Credentials"
          description="Use these test keys to authenticate your Sandbox API requests."
          showMerchantId={true}
        />
      </div>

      {/* ================= SECTION 3: YOUR PRODUCTS ================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Your Products
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              PayWay products configured in your Sandbox workspace.
            </p>
          </div>
          <button
            onClick={() => setRoute('/integrations')}
            className="text-xs font-semibold hover:underline cursor-pointer"
            style={{ color: '#00B4CC' }}
          >
            Explore more integrations →
          </button>
        </div>

        {!hasIntegration ? (
          /* FIRST TIME EMPTY STATE */
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-8 flex flex-col items-center justify-center text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-[#00B4CC]"
              style={{ backgroundColor: '#E6F8FA' }}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              No product integrations yet
            </h3>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-5">
              Start your first PayWay product integration to begin building and testing in Sandbox.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setRoute('/integrations')}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
                style={{ backgroundColor: '#00B4CC' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0A9BB0')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#00B4CC')}
              >
                Start a product integration
              </button>
              <button
                onClick={() => setRoute('/integrations')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer px-3 py-2"
              >
                Explore integrations
              </button>
            </div>
          </div>
        ) : (
          /* EXISTING USER INTEGRATIONS LIST */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active QR API Card - Standardized */}
            <Card className="hover:border-cyan-300 transition-all shadow-2xs border-cyan-200">
              <CardHeader
                action={
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-md">
                      NBC KHQR
                    </span>
                    <StatusBadge status={qrStatusVariant} label={qrStatusLabel} size="sm" />
                  </div>
                }
              >
                <CardTitle icon={<QrCode className="w-5 h-5" />}>
                  QR API
                </CardTitle>
                <CardDescription>
                  {qrStage}
                </CardDescription>
              </CardHeader>

              {/* Current stage and actual activity */}
              <div className="px-6 py-4 bg-gray-50/70 border-y border-gray-100">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase block">Current Stage</span>
                    <span className="font-bold text-gray-800 mt-0.5 block">{qrStage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase block">{qrProgressLabel}</span>
                    <span className="font-bold text-gray-800 mt-0.5 block">{qrProgressValue}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase block">Last Activity</span>
                  <span className="font-semibold text-gray-700 mt-0.5 block truncate">{lastActivityLabel}</span>
                </div>
              </div>

              <CardContent className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {qrStatusLabel}
                </span>
                <button
                  onClick={() => setRoute(qrCtaRoute)}
                  className="text-xs font-semibold px-4 py-2 rounded-lg text-white shadow-2xs transition-all hover:opacity-95 cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  <span>{qrCtaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ================= SECTION 4: RECENT API ACTIVITY ================= */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Recent API Activity</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Sandbox request logs, payments, and webhooks
            </p>
          </div>
          {displayLogs && displayLogs.length > 0 && (
            <button
              onClick={() => setRoute('/integrations/qr-api/activity')}
              className="text-xs font-semibold hover:underline cursor-pointer"
              style={{ color: '#00B4CC' }}
            >
              View full activity log →
            </button>
          )}
        </div>

        {displayLogs && displayLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="py-2.5 px-6">Timestamp</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Endpoint / Event</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-6">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayLogs.slice(0, 5).map(log => (
                  <tr
                    key={log.id}
                    onClick={() => {
                      setSelectedActivityLogId(log.id);
                      setRoute('/integrations/qr-api/activity');
                    }}
                    className="hover:bg-cyan-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-6 text-gray-500 text-[11px] font-mono">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.method === 'POST'
                            ? 'bg-blue-50 text-blue-700'
                            : log.method === 'GET'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-800">
                      {log.endpoint}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status >= 200 && log.status < 300
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-700 text-[11px] font-medium">
                      {log.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mb-3 text-[#00B4CC]">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-800">No API activity yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">
              Your Sandbox requests, payments and webhooks will appear here once you start integrating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function FirstTimeDashboard({
  state,
  setRoute,
  addToast,
}: {
  state: ReturnType<typeof useSandbox>['state'];
  setRoute: (route: string) => void;
  addToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}) {
  const [minimized, setMinimized] = useState(false);

  const hasIntegration = Boolean(state.hasCreatedFirstIntegration || state.hasIntegration || state.qrIntegrationStatus !== 'not_started');
  const hasApiCall = Boolean(state.hasMadeFirstApiCall);
  const hasPayment = Boolean(state.hasCompletedFirstTestPayment);
  const hasProductionRequest = state.reviewStatus !== 'none' || state.productionAccessStatus !== 'sandbox';
  const hasLiveAccess = state.reviewStatus === 'approved' || state.productionAccessStatus === 'full_production' || state.productionCredentialsDeliveryStatus === 'sent';
  const steps = [hasIntegration, hasApiCall, hasPayment, hasProductionRequest, hasLiveAccess];
  const completed = steps.filter(Boolean).length;
  const nextStep = steps.findIndex(step => !step);

  const continueSetup = () => {
    const routes = ['/integrations', '/integrations/qr-api', '/integrations/qr-api/testing', '/integrations/qr-api/production', '/integrations/qr-api/production'];
    setRoute(routes[nextStep < 0 ? 0 : nextStep]);
  };

  const minimize = () => {
    setMinimized(true);
    addToast('Setup guide minimized', 'You can continue your setup anytime from the bottom-right corner.', 'info');
  };

  if (minimized) {
    return (
      <>
        <div className="flex flex-col gap-6 w-full pb-12">
          <WelcomeHeader />
          <div data-tour="credentials">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sandbox Credentials</div>
            <CredentialCard title="Sandbox Credentials" description="Use these test keys to authenticate your Sandbox API requests." showMerchantId={true} />
          </div>
        </div>
        <button type="button" onClick={() => setMinimized(false)} className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 text-xs font-semibold text-gray-800 shadow-xl hover:border-cyan-400 hover:shadow-2xl">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-cyan-400 text-[9px] font-bold text-[#00B4CC]">{completed}</span>
          Setup guide <span className="text-[#00B4CC]">· {completed} of 5</span><span className="text-gray-400">↑</span>
        </button>
      </>
    );
  }

  const taskCopy = [
    ['Start your first integration', 'Choose a PayWay product and create your first Sandbox integration.'],
    ['Make your first API call', 'Send your first successful request to a PayWay Sandbox endpoint.'],
    ['Make your first test payment', 'Complete a successful payment using the PayWay Sandbox simulator.'],
    ['Request Production Access', 'Complete your requirements and submit your integration for review.'],
    ['Go live with your first product', 'Get approved and receive your production credentials.'],
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <WelcomeHeader />
      <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-2xs sm:p-8" aria-labelledby="setup-guide-title">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#00B4CC]">Get started with PayWay Sandbox</p>
              <h2 id="setup-guide-title" className="mt-2 text-2xl font-bold text-[#0D3D4F]">Your setup guide</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">Follow these steps to start building and testing safely in Sandbox. Your progress updates automatically as you use PayWay.</p>
            </div>
            <button type="button" onClick={minimize} className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-700">Close setup guide</button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500"><span>Setup progress</span><span className="text-[#0D3D4F]">{completed} of 5 completed</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#00B4CC] transition-all" style={{ width: `${(completed / 5) * 100}%` }} /></div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {taskCopy.map(([title, description], index) => {
              const complete = steps[index];
              const active = index === nextStep;
              return <button type="button" key={title} onClick={active ? continueSetup : undefined} className={`flex items-start gap-3 rounded-xl border p-4 text-left ${complete ? 'border-emerald-100 bg-emerald-50/50' : active ? 'border-cyan-200 bg-cyan-50/50 shadow-sm' : 'border-gray-100 bg-gray-50/50'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? 'bg-emerald-500 text-white' : active ? 'border-2 border-[#00B4CC] text-[#00B4CC]' : 'border border-gray-300 text-gray-400'}`}>{complete ? '✓' : index + 1}</span>
                <span><span className={`block text-sm font-semibold ${complete ? 'text-emerald-800' : active ? 'text-[#0D3D4F]' : 'text-gray-500'}`}>{title}</span><span className="mt-1 block text-xs leading-relaxed text-gray-500">{description}</span>{complete && <span className="mt-2 block text-[11px] font-semibold text-emerald-600">Completed</span>}{active && <span className="mt-2 block text-[11px] font-semibold text-[#00B4CC]">Current step</span>}</span>
              </button>;
            })}
          </div>
          <div className="flex justify-end border-t border-gray-100 pt-5"><button type="button" onClick={continueSetup} className="rounded-lg bg-[#00B4CC] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#009cb2]">Continue setup →</button></div>
        </div>
      </section>
      <div data-tour="credentials"><div className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Sandbox Credentials</div><CredentialCard title="Sandbox Credentials" description="Use these test keys to authenticate your Sandbox API requests." showMerchantId={true} /></div>
    </div>
  );
}

function WelcomeHeader() {
  return <div><h1 className="text-xl font-bold text-[#0D3D4F]">Welcome to PayWay Sandbox, <span className="text-[#00B4CC]">Henry</span></h1><p className="mt-1 text-xs text-gray-500">Build and test PayWay integrations safely before accepting live payments.</p></div>;
}



