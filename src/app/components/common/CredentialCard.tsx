import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { SANDBOX_CREDENTIALS } from '../../constants/sandboxCredentials';
import { Key, Copy, Check, Eye, EyeOff, ChevronDown, ChevronUp, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatSandboxDate, getSandboxAccessMessage, getSandboxDaysRemaining } from '../../utils/sandboxLifecycle';

interface CredentialCardProps {
  title?: string;
  description?: string;
  showMerchantId?: boolean;
  showWebhook?: boolean;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  title = 'Sandbox Credentials',
  description = 'Use these credentials to authenticate and verify requests while developing against the PayWay Sandbox environment.',
  showMerchantId = true,
  showWebhook = false,
}) => {
  const { state, updateState, addToast, getSandboxCredentialStatus, requestSandboxExtension, approveSandboxExtension } = useSandbox();
  const lifecycleStatus = getSandboxCredentialStatus();
  const daysRemaining = getSandboxDaysRemaining(state.expiresAt);

  const merchantId = state.merchantId || SANDBOX_CREDENTIALS.merchantId;
  const apiKey = state.apiKey || SANDBOX_CREDENTIALS.apiKey;
  const rsaPublicKey = state.rsaPublicKey || SANDBOX_CREDENTIALS.rsaPublicKey;
  const webhookUrl = state.webhookUrl || 'https://api.yourcompany.com/v1/payway-webhook';

  // Local UI visibility states
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [rsaExpanded, setRsaExpanded] = useState(false);

  // Copied indicator states
  const [copiedMerchant, setCopiedMerchant] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [copiedRsa, setCopiedRsa] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const copyToClipboard = (text: string, label: string, setCopiedFn: (val: boolean) => void) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedFn(true);
    updateState({ hasCopiedApiCredentials: true });
    addToast('Copied to Clipboard', `${label} copied`, 'success');
    setTimeout(() => setCopiedFn(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div className="flex items-start sm:items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 sm:mt-0"
            style={{ backgroundColor: '#E6F8FA' }}
          >
            <Key className="w-4 h-4 text-[#00B4CC]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-gray-900">{title}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-md">
                Sandbox
              </span>
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
      </div>

      <div className={`rounded-lg border px-3.5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${lifecycleStatus === 'active' ? 'bg-emerald-50 border-emerald-200' : lifecycleStatus === 'expiring_soon' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="flex items-start gap-2.5">
          {lifecycleStatus === 'active' ? <Clock className="w-4 h-4 text-emerald-700 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5" />}
          <div>
            <div className="text-xs font-bold text-gray-800">Sandbox access: {lifecycleStatus === 'extension_requested' ? 'Extension requested' : lifecycleStatus.replace('_', ' ')}</div>
            <p className="text-[11px] text-gray-600 mt-0.5">{getSandboxAccessMessage(lifecycleStatus)} Expires {formatSandboxDate(state.expiresAt)}{daysRemaining !== null && daysRemaining >= 0 ? ` (${daysRemaining} days)` : ''}.</p>
          </div>
        </div>
        {lifecycleStatus === 'expired' && <button type="button" onClick={requestSandboxExtension} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 text-white text-[11px] font-semibold hover:bg-gray-800"><RefreshCw className="w-3.5 h-3.5" /> Request extension</button>}
        {lifecycleStatus === 'extension_requested' && <button type="button" onClick={approveSandboxExtension} className="text-[11px] font-semibold text-gray-700 underline underline-offset-2">Simulate approval</button>}
      </div>

      {/* Credential Rows Container */}
      <div className="flex flex-col gap-3.5">
        {/* 1. MERCHANT ID */}
        {showMerchantId && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5">
            <div className="sm:w-36 shrink-0">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Merchant ID
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2 bg-gray-50/80 rounded-lg border border-gray-200/80 px-3.5 py-2 overflow-hidden">
              <span className="font-mono text-xs text-gray-800 font-semibold truncate flex-1 tracking-wide select-all">
                {merchantId}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => copyToClipboard(merchantId, 'Merchant ID', setCopiedMerchant)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors cursor-pointer hover:bg-cyan-50/50"
                style={{ color: '#00B4CC', borderColor: '#00B4CC' }}
              >
                {copiedMerchant ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 2. API KEY */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5">
          <div className="sm:w-36 shrink-0">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              API Key
            </span>
          </div>

          <div className="flex-1 flex items-center gap-2 bg-gray-50/80 rounded-lg border border-gray-200/80 px-3.5 py-2 overflow-hidden">
            <span
              className="font-mono text-xs text-gray-800 font-semibold truncate flex-1 select-all"
              style={{ letterSpacing: apiKeyRevealed ? '0.04em' : '0.15em' }}
            >
              {apiKeyRevealed ? apiKey : '••••••••••••••••••••••••••••••••'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setApiKeyRevealed(!apiKeyRevealed)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#00B4CC' }}
            >
              {apiKeyRevealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reveal</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard(apiKey, 'API Key', setCopiedApiKey)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors cursor-pointer hover:bg-cyan-50/50"
              style={{ color: '#00B4CC', borderColor: '#00B4CC' }}
            >
              {copiedApiKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. RSA PUBLIC KEY */}
        <div className="flex flex-col gap-2 py-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="sm:w-36 shrink-0">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                RSA Public Key
              </span>
            </div>

            {!rsaExpanded ? (
              <div className="flex-1 flex items-center gap-2 bg-gray-50/80 rounded-lg border border-gray-200/80 px-3.5 py-2 overflow-hidden">
                <span className="font-mono text-xs text-gray-600 truncate flex-1 tracking-wider select-all">
                  -----BEGIN PUBLIC KEY----- ••••••••••••
                </span>
              </div>
            ) : (
              <div className="flex-1 text-xs text-gray-500 font-medium italic sm:px-1">
                Full PEM-formatted RSA Public Key
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setRsaExpanded(!rsaExpanded)}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#00B4CC' }}
              >
                {rsaExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>View</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(rsaPublicKey, 'RSA Public Key', setCopiedRsa)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors cursor-pointer hover:bg-cyan-50/50"
                style={{ color: '#00B4CC', borderColor: '#00B4CC' }}
              >
                {copiedRsa ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Expanded RSA Public Key Area */}
          {rsaExpanded && (
            <div className="mt-1 bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-inner flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pb-2 border-b border-slate-800">
                <span>PEM RSA 2048-bit Public Key</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(rsaPublicKey, 'RSA Public Key', setCopiedRsa)}
                  className="text-[#00B4CC] hover:text-cyan-300 transition-colors font-sans font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedRsa ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed select-all scrollbar-thin scrollbar-thumb-slate-700 p-1">
                {rsaPublicKey}
              </pre>
            </div>
          )}
        </div>

        {/* 4. WEBHOOK URL (Optional) */}
        {showWebhook && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5 border-t border-gray-100 pt-3">
            <div className="sm:w-36 shrink-0">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Webhook URL
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2 bg-gray-50/80 rounded-lg border border-gray-200/80 px-3.5 py-2 overflow-hidden">
              <span className="font-mono text-xs text-gray-700 truncate flex-1 select-all">
                {webhookUrl}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => copyToClipboard(webhookUrl, 'Webhook URL', setCopiedWebhook)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors cursor-pointer hover:bg-cyan-50/50"
                style={{ color: '#00B4CC', borderColor: '#00B4CC' }}
              >
                {copiedWebhook ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
