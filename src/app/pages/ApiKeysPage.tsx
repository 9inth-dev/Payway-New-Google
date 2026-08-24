import React from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { CredentialCard } from '../components/common/CredentialCard';

export const ApiKeysPage: React.FC = () => {
  useSandbox();
  return (
    <div className="flex w-full flex-col gap-5">
      <PageHeader title="API Keys" description="Manage the credentials used to authenticate your PayWay Sandbox API requests." />
      <CredentialCard title="Sandbox API Credentials" description="Use these credentials to authenticate and verify requests while developing against the PayWay Sandbox environment." showMerchantId={true} showWebhook={true} />
      <Card>
        <CardHeader>
          <CardTitle>API Key Security &amp; Usage Rules</CardTitle>
          <CardDescription>Important guidelines for managing ABA PayWay Sandbox credentials</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-xs text-gray-600">
          <div className="flex items-start gap-2.5"><span className="font-bold text-cyan-600">1.</span><p><strong>Never expose your API Key or private server credentials in client-side code</strong> (HTML/React browser JS). Always proxy requests through your secure server environment.</p></div>
          <div className="flex items-start gap-2.5"><span className="font-bold text-cyan-600">2.</span><p>Request payloads are authenticated using your <strong>Merchant ID</strong> and <strong>API Key</strong>, and verified with your <strong>RSA Public Key</strong>.</p></div>
          <div className="flex items-start gap-2.5"><span className="font-bold text-cyan-600">3.</span><p>Sandbox keys are isolated to <code>checkout-sandbox.payway.com.kh</code> and will not accept real currency or debit real bank accounts.</p></div>
          <div className="mt-1 flex items-start gap-2.5 border-t border-gray-100 pt-2"><span className="font-bold text-amber-600">*</span><p className="text-gray-500"><strong className="text-gray-700">Production credentials:</strong> Production credentials are sent to your registered email address after approval and are not displayed in Sandbox.</p></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysPage;
