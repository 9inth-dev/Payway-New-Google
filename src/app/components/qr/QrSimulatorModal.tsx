import React, { useState, useEffect } from 'react';
import { useSandbox } from '../../context/SandboxContext';
import {
  CURRENT_GENERATE_QR_ENDPOINT,
  CHECK_TRANSACTION_ENDPOINT,
  QR_API_DOCUMENTATION_URL,
  SUPPORTED_QR_IMAGE_TEMPLATE,
} from '../../constants/developerResources';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Radio,
  FileCode,
  Sparkles,
} from 'lucide-react';

export type SimulatorScenarioMode =
  | 'valid_qr'
  | 'callback_fallback'
  | 'outdated_endpoint'
  | 'missing_lifetime'
  | 'invalid_lifetime'
  | 'no_fallback'
  | 'fallback_failed'
  | 'missing_template'
  | 'unsupported_currency';

interface QrSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: SimulatorScenarioMode;
}

interface SimulatedEvent {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  details: string;
  timestamp: string;
}

export const QrSimulatorModal: React.FC<QrSimulatorModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'valid_qr',
}) => {
  const { state, updateTestingState, addTransaction, addToast, addApiLog, guardSandboxAccess } = useSandbox();

  const [activeScenario, setActiveScenario] = useState<SimulatorScenarioMode>(initialMode);
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
  const [amount, setAmount] = useState('15.50');
  const [lifetimeSeconds, setLifetimeSeconds] = useState('900');
  const [templateName, setTemplateName] = useState(SUPPORTED_QR_IMAGE_TEMPLATE);
  const [itemDescription, setItemDescription] = useState('PayWay Sandbox Order');

  const [events, setEvents] = useState<SimulatedEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState(false);
  const [generatedQrString, setGeneratedQrString] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveScenario(initialMode);
      setEvents([]);
      setIsSimulating(false);
      setSimulationCompleted(false);
      setGeneratedQrString(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleRunSimulation = () => {
    if (isSimulating) return;
    if (!guardSandboxAccess()) {
      setEvents([{ id: 'blocked', title: 'POST /api/v1/purchase/create_qr', status: 'failed', details: '403 Forbidden — Sandbox credentials are not currently active', timestamp: new Date().toLocaleTimeString() }]);
      setSimulationCompleted(true);
      return;
    }
    setIsSimulating(true);
    setEvents([]);
    setSimulationCompleted(false);

    const parsedAmount = parseFloat(amount) || 15.50;
    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    // -------------------------------------------------------------
    // SCENARIO 1: VALID QR PAYMENT TEST
    // -------------------------------------------------------------
    if (activeScenario === 'valid_qr') {
      const qrData = `00020101021238580016A0000007700001010112${state.merchantId}520459995303${currency === 'USD' ? '840' : '116'}5404${parsedAmount.toFixed(
        2
      )}5802KH5912PAYWAY_TEST6010PHNOM_PENH63047A1F`;
      setGeneratedQrString(qrData);

      const initialEvents: SimulatedEvent[] = [
        {
          id: 'ev1',
          title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`,
          status: 'running',
          details: `Creating QR with lifetime=${lifetimeSeconds}s, template=${templateName}, currency=${currency}...`,
          timestamp: timeStr,
        },
        {
          id: 'ev2',
          title: 'Customer scans KHQR in ABA Mobile',
          status: 'pending',
          details: 'Simulating mobile banking app authorization',
          timestamp: '',
        },
        {
          id: 'ev3',
          title: 'Webhook notification dispatched',
          status: 'pending',
          details: `POST ${state.webhookUrl}`,
          timestamp: '',
        },
        {
          id: 'ev4',
          title: `GET ${CHECK_TRANSACTION_ENDPOINT}`,
          status: 'pending',
          details: 'Reconfirming final payment status with PayWay server',
          timestamp: '',
        },
      ];
      setEvents(initialEvents);

      let createdTxId = '';

      // Step 1: POST create_qr (Verifies Req 1, Req 2, Req 4, and updates Req 5)
      setTimeout(() => {
        const t1 = new Date().toLocaleTimeString();
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === 'ev1'
              ? { ...ev, status: 'success', details: '200 OK — EMVCo KHQR string generated', timestamp: t1 }
              : ev.id === 'ev2'
              ? { ...ev, status: 'running' }
              : ev
          )
        );

        const currentTestedCurrencies = state.testingState?.currencySupport?.testedCurrencies || [];
        const updatedTestedCurrencies = Array.from(new Set([...currentTestedCurrencies, currency]));

        updateTestingState({
          latestGenerateQrEndpoint: {
            status: 'verified',
            lastEventTime: t1,
            lastDetails: `POST ${CURRENT_GENERATE_QR_ENDPOINT} (200 OK)`,
          },
          lifetimeParameter: {
            status: 'verified',
            lastEventTime: t1,
            lastDetails: `lifetime=${lifetimeSeconds}s included`,
          },
          qrImageTemplate: {
            status: 'verified',
            lastEventTime: t1,
            lastDetails: `${templateName} verified`,
          },
          currencySupport: {
            status: updatedTestedCurrencies.length >= 2 ? 'verified' : 'in_progress',
            testedCurrencies: updatedTestedCurrencies,
            lastEventTime: t1,
            lastDetails: `Tested ${currency} settlement`,
          },
        });

        addApiLog({
          method: 'POST',
          endpoint: CURRENT_GENERATE_QR_ENDPOINT,
          status: 200,
          result: 'Success',
          category: 'api_request',
          latencyMs: 115,
          verifiedRequirement: 'Latest Generate QR API endpoint & lifetime',
          requestHeaders: {
            'Content-Type': 'application/json',
            'X-PayWay-Merchant-Id': state.merchantId,
          },
          requestBody: {
            req_time: new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14),
            merchant_id: state.merchantId,
            amount: parsedAmount,
            currency: currency,
            lifetime: parseInt(lifetimeSeconds, 10) || 900,
            qr_image_template: templateName,
            items: itemDescription,
          },
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: {
            status: 0,
            description: 'Success',
            qrString: qrData,
            qrImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
            lifetime: parseInt(lifetimeSeconds, 10) || 900,
          },
        });
      }, 600);

      // Step 2: Customer payment completed
      setTimeout(() => {
        const t2 = new Date().toLocaleTimeString();
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === 'ev2'
              ? { ...ev, status: 'success', details: `Payment confirmed for ${currency} ${parsedAmount.toFixed(2)}`, timestamp: t2 }
              : ev.id === 'ev3'
              ? { ...ev, status: 'running' }
              : ev
          )
        );

        const newTx = addTransaction({
          amount: parsedAmount,
          currency: currency,
          description: itemDescription,
          status: 'SUCCESS',
          paymentType: 'KHQR',
          payerName: 'Sokha Chan (ABA Mobile)',
        });
        createdTxId = newTx.tranId;

        addApiLog({
          method: 'POST',
          endpoint: '/payments/complete-scan',
          status: 200,
          result: 'SUCCESS',
          category: 'payment',
          tranId: newTx.tranId,
          latencyMs: 290,
          verifiedRequirement: 'Payment completed',
          requestHeaders: { 'Content-Type': 'application/json' },
          requestBody: { tran_id: newTx.tranId, amount: parsedAmount, currency: currency },
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: { status: 0, status_code: 'SUCCESS', approval_code: 'APV992102' },
        });
      }, 1500);

      // Step 3: Webhook callback acknowledged
      setTimeout(() => {
        const t3 = new Date().toLocaleTimeString();
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === 'ev3'
              ? { ...ev, status: 'success', details: '200 OK — Webhook listener acknowledged callback', timestamp: t3 }
              : ev.id === 'ev4'
              ? { ...ev, status: 'running' }
              : ev
          )
        );

        addApiLog({
          method: 'Webhook',
          endpoint: 'payment.completed',
          status: 200,
          result: 'Received',
          category: 'webhook',
          tranId: createdTxId,
          latencyMs: 78,
          verifiedRequirement: 'Webhook received',
          requestHeaders: { 'Content-Type': 'application/json', 'X-PayWay-Webhook-Signature': state.webhookSecret },
          requestBody: {
            event: 'payment.completed',
            merchant_id: state.merchantId,
            tran_id: createdTxId,
            amount: parsedAmount,
            currency: currency,
            status: 'SUCCESS',
          },
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: { received: true, code: 200, message: 'Acknowledged' },
        });
      }, 2300);

      // Step 4: Status confirmation check
      setTimeout(() => {
        const t4 = new Date().toLocaleTimeString();
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === 'ev4'
              ? { ...ev, status: 'success', details: 'Final status = SUCCESS reconfirmed', timestamp: t4 }
              : ev
          )
        );

        addApiLog({
          method: 'GET',
          endpoint: CHECK_TRANSACTION_ENDPOINT,
          status: 200,
          result: 'SUCCESS',
          category: 'api_request',
          tranId: createdTxId,
          latencyMs: 88,
          verifiedRequirement: 'Transaction status confirmed',
          requestHeaders: { 'X-PayWay-Merchant-Id': state.merchantId },
          requestBody: { tran_id: createdTxId },
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: { status: 0, tran_id: createdTxId, payment_status: 'SUCCESS', amount: parsedAmount, currency: currency },
        });

        setIsSimulating(false);
        setSimulationCompleted(true);
        addToast('Test Payment Completed', `Verified QR payment creation and activity with ${currency}`, 'success');
      }, 3100);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 2: CALLBACK FAILURE & CHECK TRANSACTION FALLBACK
    // -------------------------------------------------------------
    if (activeScenario === 'callback_fallback') {
      const qrData = `00020101021238580016A0000007700001010112${state.merchantId}520459995303840540415.505802KH5912PAYWAY_TEST6010PHNOM_PENH63047A1F`;
      setGeneratedQrString(qrData);

      const initialEvents: SimulatedEvent[] = [
        {
          id: 'fb1',
          title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`,
          status: 'running',
          details: 'Creating standard KHQR payment',
          timestamp: timeStr,
        },
        {
          id: 'fb2',
          title: 'Customer completes payment',
          status: 'pending',
          details: 'ABA Mobile customer payment succeeds',
          timestamp: '',
        },
        {
          id: 'fb3',
          title: 'Webhook notification fails (504 Timeout)',
          status: 'pending',
          details: 'Merchant callback endpoint unresponsive or dropped connection',
          timestamp: '',
        },
        {
          id: 'fb4',
          title: `Integration calls ${CHECK_TRANSACTION_ENDPOINT} fallback`,
          status: 'pending',
          details: 'Executing automated status reconfirmation query',
          timestamp: '',
        },
        {
          id: 'fb5',
          title: 'Payment status recovered as SUCCESS',
          status: 'pending',
          details: 'Check Transaction returns final verified SUCCESS state',
          timestamp: '',
        },
      ];
      setEvents(initialEvents);

      let createdTxId = '';

      // Step 1: Create QR
      setTimeout(() => {
        const t1 = new Date().toLocaleTimeString();
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === 'fb1'
              ? { ...ev, status: 'success', details: '200 OK — QR generated', timestamp: t1 }
              : ev.id === 'fb2'
              ? { ...ev, status: 'running' }
              : ev
          )
        );
      }, 500);

      // Step 2: Payment completed
      setTimeout(() => {
        const t2 = new Date().toLocaleTimeString();
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === 'fb2'
              ? { ...ev, status: 'success', details: 'Payment completed by customer in ABA Mobile', timestamp: t2 }
              : ev.id === 'fb3'
              ? { ...ev, status: 'running' }
              : ev
          )
        );

        const newTx = addTransaction({
          amount: parsedAmount,
          currency: 'USD',
          description: 'Callback Fallback Test Transaction',
          status: 'SUCCESS',
          paymentType: 'KHQR',
          payerName: 'Kosal Heng (ABA Mobile)',
        });
        createdTxId = newTx.tranId;
      }, 1200);

      // Step 3: Webhook delivery fails
      setTimeout(() => {
        const t3 = new Date().toLocaleTimeString();
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === 'fb3'
              ? { ...ev, status: 'failed', details: '504 Gateway Timeout — Callback notification dropped', timestamp: t3 }
              : ev.id === 'fb4'
              ? { ...ev, status: 'running' }
              : ev
          )
        );

        addApiLog({
          method: 'Webhook',
          endpoint: 'payment.completed',
          status: 504,
          result: 'Failed Delivery',
          category: 'webhook',
          tranId: createdTxId,
          latencyMs: 5000,
          verifiedRequirement: 'Webhook delivery simulated timeout',
          requestHeaders: { 'Content-Type': 'application/json' },
          requestBody: { event: 'payment.completed', tran_id: createdTxId },
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: { error: 'Gateway Timeout', message: 'Endpoint did not respond in 5000ms' },
        });
      }, 2000);

      // Step 4 & 5: Check Transaction fallback called and recovers status -> VERIFIED REQ 3!
      setTimeout(() => {
        const t4 = new Date().toLocaleTimeString();
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === 'fb4'
              ? { ...ev, status: 'success', details: `GET ${CHECK_TRANSACTION_ENDPOINT} (200 OK)`, timestamp: t4 }
              : ev.id === 'fb5'
              ? { ...ev, status: 'success', details: 'Payment status confirmed = SUCCESS (Fallback verified ✓)', timestamp: t4 }
              : ev
          )
        );

        updateTestingState({
          checkTransactionFallback: {
            status: 'verified',
            lastEventTime: t4,
            lastTxId: createdTxId,
            lastDetails: 'Recovered status after failed callback notification',
          },
        });

        addApiLog({
          method: 'GET',
          endpoint: CHECK_TRANSACTION_ENDPOINT,
          status: 200,
          result: 'SUCCESS (Fallback)',
          category: 'api_request',
          tranId: createdTxId,
          latencyMs: 92,
          verifiedRequirement: 'Check Transaction fallback implemented',
          requestHeaders: { 'X-PayWay-Merchant-Id': state.merchantId },
          requestBody: { tran_id: createdTxId },
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: { status: 0, tran_id: createdTxId, payment_status: 'SUCCESS', fallback_triggered: true },
        });

        setIsSimulating(false);
        setSimulationCompleted(true);
        addToast('Check Transaction Fallback Verified', 'Requirement 3: Check Transaction fallback marked as Verified!', 'success');
      }, 2900);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 3: OUTDATED GENERATE QR ENDPOINT
    // -------------------------------------------------------------
    if (activeScenario === 'outdated_endpoint') {
      const outdatedUrl = '/api/v0.9/purchase/generate_qr';
      setEvents([
        { id: 'oe1', title: `POST ${outdatedUrl}`, status: 'running', details: 'Sending request to deprecated QR endpoint...', timestamp: timeStr },
      ]);

      setTimeout(() => {
        const t1 = new Date().toLocaleTimeString();
        setEvents([
          { id: 'oe1', title: `POST ${outdatedUrl}`, status: 'failed', details: '400 Bad Request — Deprecated endpoint detected', timestamp: t1 },
        ]);

        updateTestingState({
          latestGenerateQrEndpoint: {
            status: 'action_required',
            errorTitle: 'Update your Generate QR endpoint',
            errorMessage:
              'This request is using an outdated Generate QR API endpoint. Update your integration to the latest supported endpoint before requesting production access.',
            actionText: 'View API documentation',
            actionUrl: QR_API_DOCUMENTATION_URL,
            lastEventTime: t1,
            lastDetails: `Deprecated endpoint ${outdatedUrl} used`,
          },
        });

        addApiLog({
          method: 'POST',
          endpoint: outdatedUrl,
          status: 400,
          result: 'Deprecated Endpoint',
          category: 'api_request',
          latencyMs: 65,
          requestHeaders: { 'Content-Type': 'application/json' },
          requestBody: { amount: parsedAmount },
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: { error: 'DEPRECATED_ENDPOINT', message: 'Please upgrade to /api/v1/purchase/create_qr' },
        });

        setIsSimulating(false);
        setSimulationCompleted(true);
        addToast('Outdated Endpoint Detected', 'Requirement 1 set to Action required', 'info');
      }, 700);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 4: MISSING LIFETIME PARAMETER
    // -------------------------------------------------------------
    if (activeScenario === 'missing_lifetime') {
      setEvents([
        { id: 'ml1', title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`, status: 'running', details: 'Payload without lifetime parameter', timestamp: timeStr },
      ]);

      setTimeout(() => {
        const t1 = new Date().toLocaleTimeString();
        setEvents([
          { id: 'ml1', title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`, status: 'failed', details: 'Validation failed: `lifetime` parameter missing', timestamp: t1 },
        ]);

        updateTestingState({
          lifetimeParameter: {
            status: 'action_required',
            errorTitle: '`lifetime` parameter missing',
            errorMessage: 'Add the `lifetime` parameter to your Generate QR request before testing again.',
            actionText: 'View QR API documentation',
            actionUrl: QR_API_DOCUMENTATION_URL,
            lastEventTime: t1,
            lastDetails: 'Request rejected: missing lifetime',
          },
        });

        setIsSimulating(false);
        setSimulationCompleted(true);
        addToast('Missing Lifetime Parameter', 'Requirement 2 marked as Action required', 'info');
      }, 700);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 5: INVALID LIFETIME VALUE
    // -------------------------------------------------------------
    if (activeScenario === 'invalid_lifetime') {
      setEvents([
        { id: 'il1', title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`, status: 'running', details: 'Payload with lifetime=-60 (negative seconds)', timestamp: timeStr },
      ]);

      setTimeout(() => {
        const t1 = new Date().toLocaleTimeString();
        setEvents([
          { id: 'il1', title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`, status: 'failed', details: '422 Unprocessable Entity — Invalid lifetime value', timestamp: t1 },
        ]);

        updateTestingState({
          lifetimeParameter: {
            status: 'failed',
            errorTitle: 'Invalid `lifetime` value',
            errorMessage: 'The `lifetime` value in this request is not valid. Check the QR API documentation and update the request before testing again.',
            actionText: 'View QR API documentation',
            actionUrl: QR_API_DOCUMENTATION_URL,
            lastEventTime: t1,
            lastDetails: 'lifetime=-60 invalid',
          },
        });

        setIsSimulating(false);
        setSimulationCompleted(true);
        addToast('Invalid Lifetime Value', 'Requirement 2 marked as Failed', 'info');
      }, 700);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 6: CALLBACK FAILED & NO CHECK TRANSACTION FALLBACK
    // -------------------------------------------------------------
    if (activeScenario === 'no_fallback') {
      setEvents([
        { id: 'nf1', title: 'Callback notification fails', status: 'failed', details: 'Merchant server unreachable (504 Timeout)', timestamp: timeStr },
        { id: 'nf2', title: 'No Check Transaction fallback detected', status: 'failed', details: 'No status reconfirmation API request was dispatched', timestamp: '' },
      ]);

      setTimeout(() => {
        const t1 = new Date().toLocaleTimeString();
        updateTestingState({
          checkTransactionFallback: {
            status: 'action_required',
            errorTitle: 'Payment status was not reconfirmed',
            errorMessage: 'The callback failed, but no Check Transaction request was detected. Implement the Check Transaction API as a fallback to reconfirm the payment status.',
            actionText: 'View implementation guide',
            actionUrl: QR_API_DOCUMENTATION_URL,
            lastEventTime: t1,
          },
        });

        setIsSimulating(false);
        setSimulationCompleted(true);
        addToast('Fallback Not Detected', 'Requirement 3 marked as Action required', 'info');
      }, 800);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 7: CHECK TRANSACTION FALLBACK FAILED
    // -------------------------------------------------------------
    if (activeScenario === 'fallback_failed') {
      setEvents([
        { id: 'ff1', title: 'Callback notification fails', status: 'failed', details: 'Callback failed (500 Server Error)', timestamp: timeStr },
        { id: 'ff2', title: `GET ${CHECK_TRANSACTION_ENDPOINT}`, status: 'failed', details: 'Check Transaction request failed (500 Error)', timestamp: '' },
      ]);

      setTimeout(() => {
        const t1 = new Date().toLocaleTimeString();
        updateTestingState({
          checkTransactionFallback: {
            status: 'failed',
            errorTitle: 'Check Transaction failed',
            errorMessage: 'PayWay detected the fallback request, but the payment status could not be reconfirmed. Review the request and try again.',
            actionText: 'View API activity',
            actionRoute: '/integrations/qr-api/activity',
            lastEventTime: t1,
          },
        });

        setIsSimulating(false);
        setSimulationCompleted(true);
        addToast('Check Transaction Failed', 'Requirement 3 marked as Failed', 'info');
      }, 800);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 8: MISSING QR IMAGE TEMPLATE
    // -------------------------------------------------------------
    if (activeScenario === 'missing_template') {
      setEvents([
        { id: 'mt1', title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`, status: 'running', details: 'Request missing qr_image_template parameter', timestamp: timeStr },
      ]);

      setTimeout(() => {
        const t1 = new Date().toLocaleTimeString();
        setEvents([
          { id: 'mt1', title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`, status: 'failed', details: 'qr_image_template not specified in configuration', timestamp: t1 },
        ]);

        updateTestingState({
          qrImageTemplate: {
            status: 'action_required',
            errorTitle: '`qr_image_template` not detected',
            errorMessage: "Use PayWay's provided `qr_image_template` when rendering the QR payment experience.",
            actionText: 'View implementation guide',
            actionUrl: QR_API_DOCUMENTATION_URL,
            lastEventTime: t1,
          },
        });

        setIsSimulating(false);
        setSimulationCompleted(true);
        addToast('Template Not Detected', 'Requirement 4 marked as Action required', 'info');
      }, 700);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 9: UNSUPPORTED CURRENCY
    // -------------------------------------------------------------
    if (activeScenario === 'unsupported_currency') {
      setEvents([
        { id: 'uc1', title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`, status: 'running', details: 'Request with currency="EUR" (Unsupported)', timestamp: timeStr },
      ]);

      setTimeout(() => {
        const t1 = new Date().toLocaleTimeString();
        setEvents([
          { id: 'uc1', title: `POST ${CURRENT_GENERATE_QR_ENDPOINT}`, status: 'failed', details: '400 Invalid Currency — Only USD and KHR supported', timestamp: t1 },
        ]);

        updateTestingState({
          currencySupport: {
            status: 'failed',
            testedCurrencies: state.testingState?.currencySupport?.testedCurrencies || [],
            errorTitle: 'Unsupported currency',
            errorMessage: 'This request uses a currency that is not supported for this QR API integration. Use one of the supported settlement currencies.',
            actionText: 'View supported currencies in documentation',
            actionUrl: QR_API_DOCUMENTATION_URL,
            lastEventTime: t1,
          },
        });

        setIsSimulating(false);
        setSimulationCompleted(true);
        addToast('Unsupported Currency', 'Requirement 5 marked as Failed', 'info');
      }, 700);
      return;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-gray-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00B4CC]" />
                <h3 className="font-bold text-gray-900 text-sm">QR API Sandbox Simulator</h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Simulate standard payments, fallback recoveries, and error edge cases.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* SCENARIO SELECTOR */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Simulation Scenario
              </label>
              <select
                value={activeScenario}
                onChange={(e) => setActiveScenario(e.target.value as SimulatorScenarioMode)}
                disabled={isSimulating}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#00B4CC] focus:ring-1 focus:ring-[#00B4CC] transition-all cursor-pointer font-medium"
              >
                <optgroup label="Standard & Positive Verification Tests">
                  <option value="valid_qr">Valid Standard QR Payment (Verifies Endpoint, Lifetime, Template, Currency)</option>
                  <option value="callback_fallback">Callback Failure & Check Transaction Fallback (Verifies Fallback Req 3)</option>
                </optgroup>
                <optgroup label="Negative & Validation Error Tests">
                  <option value="outdated_endpoint">Outdated Generate QR Endpoint (Req 1: Action Required)</option>
                  <option value="missing_lifetime">Missing Lifetime Parameter (Req 2: Action Required)</option>
                  <option value="invalid_lifetime">Invalid Lifetime Value (Req 2: Failed)</option>
                  <option value="no_fallback">Callback Failed & No Fallback (Req 3: Action Required)</option>
                  <option value="fallback_failed">Check Transaction Fallback Failed (Req 3: Failed)</option>
                  <option value="missing_template">Missing QR Image Template (Req 4: Action Required)</option>
                  <option value="unsupported_currency">Unsupported Currency EUR (Req 5: Failed)</option>
                </optgroup>
              </select>
            </div>

            {/* SCENARIO PARAMETERS (Visible for standard payments) */}
            {activeScenario === 'valid_qr' && (
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 flex flex-col gap-3.5 text-xs">
                <div className="flex items-center justify-between font-bold text-gray-800 text-[11px] uppercase tracking-wider">
                  <span>Payment Parameters</span>
                  <span className="text-[#00B4CC]">Standard KHQR Payload</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Currency</label>
                    <div className="flex rounded-lg border border-gray-200 p-0.5 bg-white">
                      <button
                        type="button"
                        onClick={() => setCurrency('USD')}
                        className={`flex-1 py-1 text-center font-bold rounded text-xs transition-colors ${
                          currency === 'USD' ? 'bg-[#00B4CC] text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrency('KHR')}
                        className={`flex-1 py-1 text-center font-bold rounded text-xs transition-colors ${
                          currency === 'KHR' ? 'bg-[#00B4CC] text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        KHR (៛)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#00B4CC]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Lifetime (Seconds)</label>
                    <input
                      type="number"
                      value={lifetimeSeconds}
                      onChange={(e) => setLifetimeSeconds(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-[#00B4CC]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">QR Image Template</label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-[#00B4CC]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RUN BUTTON */}
            <div>
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2.5 px-4 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#00B4CC]" />
                    <span>Executing simulation...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {activeScenario === 'valid_qr'
                        ? `Run valid ${currency} QR test`
                        : activeScenario === 'callback_fallback'
                        ? 'Run callback fallback test'
                        : 'Execute scenario test'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* LIVE EVENT LOGS STREAM */}
            {events.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Simulation Steps &amp; Protocol Trace</span>
                  {simulationCompleted && (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-gray-50/50">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-3 text-xs flex items-start gap-3 bg-white">
                      <div className="mt-0.5 shrink-0">
                        {ev.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {ev.status === 'failed' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                        {ev.status === 'running' && <RefreshCw className="w-4 h-4 text-[#00B4CC] animate-spin" />}
                        {ev.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-bold ${
                              ev.status === 'failed'
                                ? 'text-rose-900'
                                : ev.status === 'success'
                                ? 'text-gray-900'
                                : 'text-gray-600'
                            }`}
                          >
                            {ev.title}
                          </span>
                          {ev.timestamp && <span className="text-[10px] text-gray-400 font-mono">{ev.timestamp}</span>}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{ev.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-gray-500">Simulations update your Sandbox testing state and API activity log.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
