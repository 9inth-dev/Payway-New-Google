import React from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { Code2, FlaskConical, Rocket, ArrowRight, X } from 'lucide-react';

function GoldenCube() {
  return (
    <svg width="110" height="110" viewBox="0 0 140 140" fill="none">
      <polygon points="70,20 120,47 70,74 20,47" fill="#F5C842" />
      <polygon points="20,47 70,74 70,120 20,93" fill="#C8903A" />
      <polygon points="120,47 70,74 70,120 120,93" fill="#E8A830" />
      <polygon points="70,20 120,47 70,74 20,47" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    </svg>
  );
}

export const SandboxWelcomeModal: React.FC = () => {
  const { updateState, setRoute, setTourStep, setWelcomeModalOpen, currentRoute } = useSandbox();

  const handleStartTour = () => {
    updateState({ hasSeenSandboxWelcome: true });
    setWelcomeModalOpen(false);
    if (currentRoute === '/welcome' || currentRoute === '/sandbox-welcome') {
      setRoute('/home');
    }
    // Launch guided tour on top of dashboard
    setTourStep(1);
  };

  const handleSkip = () => {
    updateState({ hasSeenSandboxWelcome: true, hasCompletedWelcomeTour: true });
    setWelcomeModalOpen(false);
    if (currentRoute === '/welcome' || currentRoute === '/sandbox-welcome') {
      setRoute('/home');
    }
    setTourStep(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      style={{
        backgroundColor: 'rgba(13, 29, 39, 0.65)',
        backdropFilter: 'blur(3px)',
      }}
    >
      {/* Centered Welcome Card overlay */}
      <div
        className="relative flex flex-col md:flex-row overflow-hidden bg-white max-w-3xl w-full my-auto rounded-2xl shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Close Button top-right */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          title="Dismiss welcome screen"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left panel - warm golden gradient + visual identity */}
        <div
          className="flex flex-col items-center justify-center relative p-6 text-center shrink-0"
          style={{
            width: '100%',
            maxWidth: '260px',
            background: 'linear-gradient(145deg, #C8A96A 0%, #D4A843 40%, #B8913A 100%)',
            minHeight: '280px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 60%, rgba(255,220,120,0.22) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <GoldenCube />
            <span className="inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/30">
              Safe Test Environment
            </span>
            <p className="text-amber-100 text-[11px] mt-2 leading-relaxed max-w-[200px] text-center">
              Simulated transactions &amp; zero financial risk
            </p>
          </div>
        </div>

        {/* Right panel - Main Welcome Content */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 relative bg-white">
          {/* Top info badge */}
          <div className="flex items-center justify-between mb-3.5 pr-8">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#00B4CC] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4CC]" />
              Developer Sandbox Ready
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
              </svg>
              EN
            </div>
          </div>

          {/* Primary Heading & Supporting Copy */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: '#0D3D4F' }}>
              Welcome to PayWay Sandbox
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1.5 leading-relaxed">
              Build, test and prepare your PayWay integrations in a safe environment before going live.
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Your Sandbox is ready. We&apos;ll quickly show you where to find your API credentials, integrations, developer tools and support.
            </p>
          </div>

          {/* Orientation Points */}
          <div className="my-4 flex flex-col gap-2.5">
            {/* Point 1 */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-cyan-100/70 text-[#00B4CC] flex items-center justify-center shrink-0 mt-0.5">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900 leading-tight">
                  Build with Sandbox APIs
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                  Develop and test your PayWay integration without moving real money.
                </p>
              </div>
            </div>

            {/* Point 2 */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900 leading-tight">
                  Test before you go live
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                  Run test payments and verify your implementation before requesting production access.
                </p>
              </div>
            </div>

            {/* Point 3 */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900 leading-tight">
                  Move to production when ready
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                  Complete your requirements and send your integration to PayWay for review.
                </p>
              </div>
            </div>
          </div>

          {/* Actions: Start Tour vs Skip */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleStartTour}
              className="w-full sm:flex-1 rounded-xl py-2.5 px-5 text-sm font-semibold text-white transition-all duration-150 cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B4CC]"
              style={{ backgroundColor: '#00B4CC' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0A9BB0')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#00B4CC')}
            >
              <span>Start tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              Skip tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
