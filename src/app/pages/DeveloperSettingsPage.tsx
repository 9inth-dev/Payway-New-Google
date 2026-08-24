import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';

export const DeveloperSettingsPage: React.FC = () => {
  const { state, updateState, addToast } = useSandbox();
  const [webhook, setWebhook] = useState(state.webhookUrl);
  const [ipWhitelist, setIpWhitelist] = useState('203.144.128.1, 103.216.52.12');
  const [hmacAlgo, setHmacAlgo] = useState('HMAC-SHA512');

  const handleSaveSettings = (event: React.FormEvent) => {
    event.preventDefault();
    updateState({ webhookUrl: webhook });
    addToast('Developer Settings Saved', 'Webhook URL & API preferences updated', 'success');
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <PageHeader title="Developer Settings" description="Configure webhook callbacks, signature algorithms, and Sandbox network access." />
      <Card>
        <CardHeader><CardTitle>Sandbox Webhook &amp; Security Settings</CardTitle><CardDescription>Configure webhook notification destinations and IP access control</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="flex max-w-xl flex-col gap-4">
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-gray-700">Webhook Notification URL</label><input type="url" value={webhook} onChange={event => setWebhook(event.target.value)} placeholder="https://yourdomain.com/v1/payway-webhook" className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs outline-none focus:border-cyan-500" required /><span className="text-[11px] text-gray-400">PayWay will send POST requests here when payment transactions succeed or fail.</span></div>
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-gray-700">Signature Algorithm</label><select value={hmacAlgo} onChange={event => setHmacAlgo(event.target.value)} className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs outline-none focus:border-cyan-500"><option value="HMAC-SHA512">HMAC-SHA512 (Recommended)</option><option value="HMAC-SHA256">HMAC-SHA256</option></select></div>
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-gray-700">Sandbox Server IP Whitelist</label><input type="text" value={ipWhitelist} onChange={event => setIpWhitelist(event.target.value)} className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 font-mono text-xs outline-none focus:border-cyan-500" /><span className="text-[11px] text-gray-400">Comma-separated IPv4 addresses allowed to send API calls</span></div>
            <button type="submit" className="mt-2 w-fit cursor-pointer rounded-lg px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95" style={{ backgroundColor: '#00B4CC' }}>Save Developer Settings</button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperSettingsPage;
