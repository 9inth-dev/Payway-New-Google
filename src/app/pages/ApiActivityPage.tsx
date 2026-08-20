import React, { useMemo, useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import type { ApiCategory, ApiLog } from '../types/sandbox';

const categoryLabels: Record<ApiCategory, string> = { api_request: 'API request', payment: 'Payment', webhook: 'Webhook', error: 'Error' };
const categoryOptions: Array<'all' | ApiCategory> = ['all', 'api_request', 'payment', 'webhook', 'error'];

export const ApiActivityPage: React.FC = () => {
  const { apiLogs, setSelectedActivityLogId, setRoute } = useSandbox();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ApiCategory>('all');
  const [selected, setSelected] = useState<ApiLog | null>(null);

  const filteredLogs = useMemo(() => apiLogs.filter(log => {
    const haystack = `${log.endpoint} ${log.method} ${log.result} ${log.tranId ?? ''}`.toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase().trim());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'success' ? log.status >= 200 && log.status < 400 : log.status >= 400);
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesQuery && matchesStatus && matchesCategory;
  }), [apiLogs, query, statusFilter, categoryFilter]);

  const successCount = apiLogs.filter(log => log.status >= 200 && log.status < 400).length;
  const errorCount = apiLogs.filter(log => log.status >= 400).length;
  const averageLatency = apiLogs.length ? Math.round(apiLogs.reduce((sum, log) => sum + (log.latencyMs ?? 0), 0) / apiLogs.length) : 0;
  const openLog = (log: ApiLog) => { setSelected(log); setSelectedActivityLogId(log.id); };
  const closeLog = () => { setSelected(null); setSelectedActivityLogId(null); };

  return <div className="relative flex flex-col gap-5 pb-12">
    <PageHeader title="API Activity" description="Monitor requests, payment events, webhooks, and errors across your Sandbox integration." actions={<><button type="button" onClick={() => setRoute('/developer/docs')} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-cyan-200 hover:text-[#00B4CC]">API documentation</button><button type="button" onClick={() => setRoute('/integrations/qr-api/testing')} className="rounded-lg bg-[#00B4CC] px-3 py-2 text-xs font-semibold text-white hover:bg-[#009cb2]">Run a test request</button></>} />

    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Total requests" value={apiLogs.length} tone="text-[#0D3D4F]" /><Metric label="Successful" value={successCount} tone="text-emerald-600" /><Metric label="Errors" value={errorCount} tone="text-rose-600" /></div>

    <section className="rounded-xl border border-gray-100 bg-white shadow-2xs">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-sm font-bold text-[#0D3D4F]">Request log</h2><p className="mt-1 text-xs text-gray-500">{filteredLogs.length} matching {filteredLogs.length === 1 ? 'event' : 'events'}{apiLogs.length ? ` · ${averageLatency} ms average latency` : ''}</p></div><div className="flex flex-wrap gap-2"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search endpoint or ID" aria-label="Search API activity" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#00B4CC] sm:w-52" /><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600"><option value="all">All statuses</option><option value="success">Success</option><option value="error">Errors</option></select><select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value as typeof categoryFilter)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600">{categoryOptions.map(option => <option key={option} value={option}>{option === 'all' ? 'All event types' : categoryLabels[option]}</option>)}</select></div></div>
      {filteredLogs.length === 0 ? <div className="flex flex-col items-center px-6 py-16 text-center"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[#00B4CC]">⌁</div><h3 className="text-sm font-bold text-[#0D3D4F]">{apiLogs.length ? 'No matching activity' : 'No API activity yet'}</h3><p className="mt-2 max-w-md text-xs leading-relaxed text-gray-500">{apiLogs.length ? 'Try clearing a filter or searching for a different endpoint.' : 'Your Sandbox requests will appear here with status, latency, and request details.'}</p>{!apiLogs.length && <button type="button" onClick={() => setRoute('/integrations/qr-api/testing')} className="mt-5 rounded-lg bg-[#00B4CC] px-4 py-2 text-xs font-semibold text-white hover:bg-[#009cb2]">Open QR API testing</button>}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wide text-gray-400"><tr><th className="px-4 py-3 font-semibold">Request</th><th className="px-4 py-3 font-semibold">Type</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Latency</th><th className="px-4 py-3 font-semibold">Time</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-gray-100">{filteredLogs.map(log => <tr key={log.id} className="cursor-pointer transition-colors hover:bg-cyan-50/30" onClick={() => openLog(log)}><td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-mono text-[11px] font-bold text-gray-500">{log.method}</span><span className="max-w-[360px] truncate font-mono text-xs text-[#0D3D4F]">{log.endpoint}</span></div><div className="mt-1 text-[11px] text-gray-400">{log.tranId ? `Transaction ${log.tranId}` : log.result}</div></td><td className="px-4 py-3 text-xs text-gray-600">{categoryLabels[log.category]}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${log.status >= 400 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{log.status}</span></td><td className="px-4 py-3 text-xs text-gray-500">{log.latencyMs ?? '—'}{log.latencyMs ? ' ms' : ''}</td><td className="px-4 py-3 text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td className="px-4 py-3 text-right text-[#00B4CC]">→</td></tr>)}</tbody></table></div>}
    </section>

    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30" role="dialog" aria-modal="true" aria-labelledby="activity-detail-title" onClick={closeLog}><aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl" onClick={event => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#00B4CC]">API Activity</p><h2 id="activity-detail-title" className="mt-1 text-lg font-bold text-[#0D3D4F]">{selected.method} {selected.endpoint}</h2></div><button type="button" onClick={closeLog} aria-label="Close activity details" className="rounded-lg px-2 py-1 text-xl text-gray-400 hover:bg-gray-50">×</button></div><div className="mt-6 grid grid-cols-2 gap-3"><Detail label="Status" value={`${selected.status} · ${selected.result}`} /><Detail label="Category" value={categoryLabels[selected.category]} /><Detail label="Latency" value={selected.latencyMs ? `${selected.latencyMs} ms` : 'Not recorded'} /><Detail label="Timestamp" value={new Date(selected.timestamp).toLocaleString()} /></div><JsonBlock title="Request body" value={selected.requestBody} /><JsonBlock title="Response body" value={selected.responseBody} />{selected.errorInfo && <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 p-4"><p className="text-xs font-bold text-rose-700">{selected.errorInfo.code}</p><p className="mt-1 text-sm text-rose-800">{selected.errorInfo.message}</p><p className="mt-2 text-xs leading-relaxed text-rose-700">{selected.errorInfo.troubleshooting}</p></div>}</aside></div>}
  </div>;
};

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) { return <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-2xs"><p className="text-xs text-gray-500">{label}</p><p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-gray-50 p-3"><p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p><p className="mt-1 break-words text-xs font-semibold text-gray-700">{value}</p></div>; }
function JsonBlock({ title, value }: { title: string; value: unknown }) { if (!value) return null; return <div className="mt-5"><p className="mb-2 text-xs font-bold text-gray-700">{title}</p><pre className="max-h-64 overflow-auto rounded-xl bg-[#0D3D4F] p-4 text-[11px] leading-relaxed text-cyan-50">{JSON.stringify(value, null, 2)}</pre></div>; }

export default ApiActivityPage;
