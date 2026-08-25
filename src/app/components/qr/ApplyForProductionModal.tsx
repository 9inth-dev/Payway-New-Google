import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { ProductionAccessStatus, ReviewStatus } from '../../types/sandbox';
import {
  Building2,
  Store,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  ShieldCheck,
  FileCheck,
  Trash2,
  RefreshCw,
  Edit3,
  AlertTriangle,
  FileSpreadsheet,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface OutletItem {
  id: string;
  name: string;
  location: string;
  eligible: boolean;
  disabledReason?: string;
}

interface BusinessProfile {
  id: string;
  name: string;
  isAuthorized: boolean;
  isNew?: boolean;
  khrAccount?: string;
  usdAccount?: string;
  patentFileName?: string;
  logoUrl?: string;
  category?: string;
  address?: string;
  outlets: OutletItem[];
}

const INITIAL_BUSINESSES: BusinessProfile[] = [
  {
    id: 'b-1',
    name: 'Henry Stores Co.',
    isAuthorized: true,
    khrAccount: '001 234 567 (KHR) - Henry Stores Co. Main',
    usdAccount: '001 234 568 (USD) - Henry Stores Co. USD',
    category: 'Retail & Shopping / Supermarkets',
    address: '#128, Preah Norodom Blvd, Phnom Penh',
    patentFileName: 'Tax_Patent_Henry_Stores_2026.pdf',
    outlets: [
      { id: 'o-1', name: 'Main Branch', location: 'Phnom Penh (BKK1)', eligible: true },
      { id: 'o-2', name: 'Airport Branch', location: 'PNH International Airport', eligible: true },
      { id: 'o-3', name: 'Siem Reap Branch', location: 'Pub Street, Siem Reap', eligible: false, disabledReason: 'QR API already enabled' },
    ],
  },
];

const ABA_KHR_ACCOUNTS = [
  '001 234 567 (KHR) - Henry Stores Co. Main Settlement',
  '001 888 123 (KHR) - Operations & Retail Account',
  '002 999 456 (KHR) - Merchant Reserve Account',
];

const ABA_USD_ACCOUNTS = [
  '001 234 568 (USD) - Henry Stores Co. USD Settlement',
  '001 888 124 (USD) - Main Commercial USD Account',
  '002 999 457 (USD) - Merchant Foreign Currency Settlement',
];

const BUSINESS_CATEGORIES = [
  'Retail & Shopping / Supermarkets',
  'Food & Beverages / Restaurants & Cafes',
  'E-Commerce & Digital Goods',
  'Hospitality, Hotels & Travel',
  'Healthcare & Pharmacy',
  'Education & Training',
  'Professional Services & Technology',
];

const SAMPLE_LOGOS = [
  { id: 'logo-store', label: 'Storefront', icon: '🏬', bg: 'bg-cyan-600 text-white' },
  { id: 'logo-cart', label: 'Shopping', icon: '🛒', bg: 'bg-emerald-600 text-white' },
  { id: 'logo-coffee', label: 'Cafe / F&B', icon: '☕', bg: 'bg-amber-600 text-white' },
  { id: 'logo-bag', label: 'Boutique', icon: '🛍️', bg: 'bg-purple-600 text-white' },
];

interface ApplyForProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyForProductionModal: React.FC<ApplyForProductionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, updateState, addToast } = useSandbox();

  // Step state: exactly 6 steps (1 to 6)
  const [step, setStep] = useState<number>(1);

  // Step 1: Submitter
  const [submitterType, setSubmitterType] = useState<'own' | 'client'>('own');

  // Step 2: Verification
  const [isAbaAccountVerified, setIsAbaAccountVerified] = useState(false);
  const [clientMerchantName, setClientMerchantName] = useState('Henry Stores Co., Ltd.');
  const [clientMerchantEmail, setClientMerchantEmail] = useState('owner@henrystores.kh');
  const [clientMerchantPhone, setClientMerchantPhone] = useState('+855 12 888 999');
  const [authSent, setAuthSent] = useState(false);
  const [isMerchantApproved, setIsMerchantApproved] = useState(false);

  // Step 3: Business & Outlet State
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(INITIAL_BUSINESSES);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('b-1');
  const [selectedOutletId, setSelectedOutletId] = useState<string>('o-1');

  // Step 3 Nested: Add New Business Subflow ('settlement' | 'details' | 'profile' | 'review')
  const [isCreatingNewBusiness, setIsCreatingNewBusiness] = useState(false);
  const [newBusinessSubstep, setNewBusinessSubstep] = useState<'settlement' | 'details' | 'profile' | 'review'>('settlement');
  const [newKhrAccount, setNewKhrAccount] = useState<string>(ABA_KHR_ACCOUNTS[0]);
  const [newUsdAccount, setNewUsdAccount] = useState<string>(ABA_USD_ACCOUNTS[0]);
  const [newStoreName, setNewStoreName] = useState<string>('');
  const [newOutletName, setNewOutletName] = useState<string>('Main Branch');
  const [newPatentFile, setNewPatentFile] = useState<string | null>(null);
  const [newLogoId, setNewLogoId] = useState<string>('logo-store');
  const [newCategory, setNewCategory] = useState<string>(BUSINESS_CATEGORIES[0]);
  const [newAddress, setNewAddress] = useState<string>('#45, Street 240, Sangkat Chaktomuk, Khan Daun Penh, Phnom Penh');
  const [businessFormError, setBusinessFormError] = useState<string | null>(null);

  // Step 4: Documents
  const [uploadedPatent, setUploadedPatent] = useState<string | null>(null);
  const [uploadedMoc, setUploadedMoc] = useState<string | null>(null);
  const [highlightedMissingDoc, setHighlightedMissingDoc] = useState<string | null>(null);

  // Step 5: Payment Methods (KHQR and ABA PAY are toggleable!)
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['KHQR', 'ABA PAY']);
  const [paymentMethodError, setPaymentMethodError] = useState<string | null>(null);
  const [missingDocWarning, setMissingDocWarning] = useState<string | null>(null);

  // Step 6: Final Review & Confirmation
  const [confirmedAuth, setConfirmedAuth] = useState(true);

  if (!isOpen) return null;

  const currentBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];
  const currentOutlet = currentBusiness?.outlets.find(o => o.id === selectedOutletId) || currentBusiness?.outlets[0];

  // Helper to check missing additional documents for selected payment methods
  const getMissingAdditionalDocuments = (methods: string[]): string[] => {
    const missing: string[] = [];
    const requiresInternational = methods.includes('WeChat Pay') || methods.includes('Alipay');
    
    if (requiresInternational) {
      if (!uploadedMoc) {
        missing.push('MOC Registration Certificate');
      }
      const hasPatent = uploadedPatent || currentBusiness?.patentFileName;
      if (!hasPatent) {
        missing.push('Patent / Tax Registration Certificate');
      }
    }
    return missing;
  };

  const handleNextStep = () => {
    setBusinessFormError(null);
    setPaymentMethodError(null);
    setMissingDocWarning(null);

    // Step 3 validation
    if (step === 3) {
      if (!selectedBusinessId) {
        setBusinessFormError('Select a business to continue.');
        return;
      }
      if (!selectedOutletId) {
        setBusinessFormError('Select an eligible outlet to continue.');
        return;
      }
      if (currentOutlet && !currentOutlet.eligible) {
        setBusinessFormError(`Outlet "${currentOutlet.name}" is not eligible (${currentOutlet.disabledReason || 'Already enabled'}). Please choose an eligible outlet.`);
        return;
      }
      setStep(4);
      return;
    }

    // Step 4 validation
    if (step === 4) {
      setHighlightedMissingDoc(null);
      setStep(5);
      return;
    }

    // Step 5 validation (Payment methods)
    if (step === 5) {
      if (selectedMethods.length === 0) {
        setPaymentMethodError('Choose at least one payment method to continue.');
        return;
      }

      // Check if selected payment methods require additional documents not yet provided
      const missing = getMissingAdditionalDocuments(selectedMethods);
      if (missing.length > 0) {
        setMissingDocWarning(`One or more selected payment methods require additional business documentation: ${missing.join(', ')}.`);
        return;
      }

      setStep(6);
      return;
    }

    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setBusinessFormError(null);
    setPaymentMethodError(null);
    setMissingDocWarning(null);

    if (step > 1) {
      setStep(step - 1);
    }
  };

  const togglePaymentMethod = (method: string) => {
    setPaymentMethodError(null);
    setMissingDocWarning(null);
    setSelectedMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  // Add New Business Subflow Handlers
  const handleStartNewBusiness = () => {
    setIsCreatingNewBusiness(true);
    setNewBusinessSubstep('settlement');
    setBusinessFormError(null);
  };

  const handleCancelNewBusiness = () => {
    setIsCreatingNewBusiness(false);
    setNewBusinessSubstep('settlement');
    setBusinessFormError(null);
  };

  const handleNewBusinessNextSubstep = () => {
    setBusinessFormError(null);

    if (newBusinessSubstep === 'settlement') {
      if (!newKhrAccount || !newUsdAccount) {
        setBusinessFormError('Select a settlement account for both KHR and USD.');
        return;
      }
      setNewBusinessSubstep('details');
    } else if (newBusinessSubstep === 'details') {
      if (!newStoreName.trim()) {
        setBusinessFormError('Enter a store name.');
        return;
      }
      if (!newPatentFile) {
        setBusinessFormError('Attach the required Patent / business registration document.');
        return;
      }
      setNewBusinessSubstep('profile');
    } else if (newBusinessSubstep === 'profile') {
      if (!newCategory) {
        setBusinessFormError('Select a business category.');
        return;
      }
      if (!newAddress.trim()) {
        setBusinessFormError('Add the store address.');
        return;
      }
      setNewBusinessSubstep('review');
    }
  };

  const handleNewBusinessPrevSubstep = () => {
    setBusinessFormError(null);
    if (newBusinessSubstep === 'settlement') {
      setIsCreatingNewBusiness(false);
    } else if (newBusinessSubstep === 'details') {
      setNewBusinessSubstep('settlement');
    } else if (newBusinessSubstep === 'profile') {
      setNewBusinessSubstep('details');
    } else if (newBusinessSubstep === 'review') {
      setNewBusinessSubstep('profile');
    }
  };

  const handleConfirmCreateBusiness = () => {
    const newId = `b-${Date.now()}`;
    const outletId = `o-${Date.now()}`;
    const createdProfile: BusinessProfile = {
      id: newId,
      name: newStoreName.trim(),
      isAuthorized: true,
      isNew: true,
      khrAccount: newKhrAccount,
      usdAccount: newUsdAccount,
      patentFileName: newPatentFile || 'Tax_Patent_Certificate_2026.pdf',
      category: newCategory,
      address: newAddress.trim(),
      outlets: [
        {
          id: outletId,
          name: newOutletName.trim() || 'Main Branch',
          location: newAddress.trim().split(',')[0] || 'Phnom Penh',
          eligible: true,
        },
      ],
    };

    setBusinesses(prev => [createdProfile, ...prev]);
    setSelectedBusinessId(newId);
    setSelectedOutletId(outletId);
    
    // Automatically carry over the patent file into Step 4 documents so it's not requested again
    if (newPatentFile) {
      setUploadedPatent(newPatentFile);
    }

    setIsCreatingNewBusiness(false);
    addToast('Business Profile Created', `Added "${createdProfile.name}" with verified settlement accounts`, 'success');
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedAuth) return;

    const isResubmission = state.reviewStatus === 'changes_requested';
    const newReviewStatus: ReviewStatus = isResubmission ? 'resubmitted' : 'submitted';
    const newAccessStatus: ProductionAccessStatus = isResubmission ? 'resubmitted' : 'submitted';

    updateState({
      productionAccessStatus: newAccessStatus,
      reviewStatus: newReviewStatus,
      productionReadiness: {
        ...state.productionReadiness,
        businessDetailsSubmitted: true,
      },
    });

    addToast(
      'Production request submitted',
      'Your QR API integration has been sent to the PayWay Integration Team for review. Reviews usually take 2 to 3 working days.',
      'success'
    );

    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setIsAbaAccountVerified(false);
    setAuthSent(false);
    setIsMerchantApproved(false);
    setIsCreatingNewBusiness(false);
    setBusinessFormError(null);
    setPaymentMethodError(null);
    setMissingDocWarning(null);
    onClose();
  };

  // Check if patent is attached (either via new business flow or Step 4)
  const activePatentDoc = uploadedPatent || currentBusiness?.patentFileName;
  const isInternationalSelected = selectedMethods.includes('WeChat Pay') || selectedMethods.includes('Alipay');

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={resetAndClose}
    >
      <div
        className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden border-l border-gray-200 animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 p-6 text-white relative shrink-0">
          <button
            onClick={resetAndClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
              Production Setup Workflow
            </span>
            <span className="text-white/60 text-xs">•</span>
            <span className="text-xs text-cyan-100 font-medium">Step {step} of 6</span>
          </div>

          <h2 className="text-xl font-bold">Apply for Production Access</h2>
          <p className="text-xs text-cyan-100 mt-0.5">
            Connect your merchant business, submit business documentation, select payment methods, and request live QR API access.
          </p>

          {/* Top Progress Indicator: Exactly 6 Steps */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/20 text-[10px] font-semibold text-white/70 overflow-x-auto pb-1 scrollbar-none">
            <span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${step === 1 ? 'bg-white text-cyan-800 font-bold' : step > 1 ? 'bg-white/30 text-white' : ''}`}>
              1. Submitter
            </span>
            <span>›</span>
            <span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${step === 2 ? 'bg-white text-cyan-800 font-bold' : step > 2 ? 'bg-white/30 text-white' : ''}`}>
              2. Verification
            </span>
            <span>›</span>
            <span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${step === 3 ? 'bg-white text-cyan-800 font-bold' : step > 3 ? 'bg-white/30 text-white' : ''}`}>
              3. Business &amp; Outlet
            </span>
            <span>›</span>
            <span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${step === 4 ? 'bg-white text-cyan-800 font-bold' : step > 4 ? 'bg-white/30 text-white' : ''}`}>
              4. Documents
            </span>
            <span>›</span>
            <span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${step === 5 ? 'bg-white text-cyan-800 font-bold' : step > 5 ? 'bg-white/30 text-white' : ''}`}>
              5. Payment Methods
            </span>
            <span>›</span>
            <span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${step === 6 ? 'bg-white text-cyan-800 font-bold' : ''}`}>
              6. Review
            </span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* ==================== STEP 1: SUBMITTER ==================== */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Who are you setting this integration up for?
                </h3>
                <p className="text-xs text-gray-500">
                  Select your relationship to the merchant business accepting live payments.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {/* Option A: My own business */}
                <div
                  onClick={() => setSubmitterType('own')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    submitterType === 'own'
                      ? 'border-[#00B4CC] bg-cyan-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    submitterType === 'own' ? 'border-[#00B4CC] bg-[#00B4CC]' : 'border-gray-300'
                  }`}>
                    {submitterType === 'own' && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">My own business</span>
                    <span className="text-xs text-gray-600 block mt-0.5">
                      I am the merchant or business owner setting up PayWay directly.
                    </span>
                  </div>
                </div>

                {/* Option B: A client's business */}
                <div
                  onClick={() => setSubmitterType('client')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    submitterType === 'client'
                      ? 'border-[#00B4CC] bg-cyan-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    submitterType === 'client' ? 'border-[#00B4CC] bg-[#00B4CC]' : 'border-gray-300'
                  }`}>
                    {submitterType === 'client' && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">A client's business</span>
                    <span className="text-xs text-gray-600 block mt-0.5">
                      I am a developer or agency integrating PayWay on behalf of a merchant.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  <span>Continue to Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: VERIFICATION ==================== */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              {submitterType === 'own' ? (
                /* 2A. MY OWN BUSINESS VERIFICATION */
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Verify your ABA account</h3>
                    <p className="text-xs text-gray-600">
                      Confirm ownership of your merchant ABA Bank account using the ABA Mobile app.
                    </p>
                  </div>

                  {!isAbaAccountVerified ? (
                    <div className="bg-gradient-to-br from-gray-50 to-cyan-50/30 border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center gap-3">
                      <div className="w-28 h-28 bg-white border-2 border-cyan-500 rounded-xl p-2 shadow-xs flex flex-col items-center justify-center relative">
                        <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 5 === 0 ? 'bg-cyan-900' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-white px-2 py-1 rounded-md text-[10px] font-extrabold text-cyan-800 border border-cyan-200 shadow-xs">
                            ABA PAY
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 max-w-sm">
                        Open ABA Mobile on your smartphone, tap <strong>Scan QR</strong>, and scan this code to authenticate ownership.
                      </p>

                      <div className="w-full pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAbaAccountVerified(true);
                            addToast('Account Verified', 'ABA Bank account ownership confirmed', 'success');
                          }}
                          className="w-full py-2.5 px-4 text-xs font-bold text-cyan-800 bg-cyan-100/80 hover:bg-cyan-200/80 rounded-lg transition-colors border border-cyan-300 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-cyan-700" />
                          <span>⚡ Simulate successful ABA Mobile verification</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-300">
                        <Check className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-emerald-950">ABA account verified</h4>
                        <p className="text-xs text-emerald-800 mt-1 max-w-md leading-relaxed">
                          Your identity and ABA account details have been verified through ABA Mobile.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-white px-3.5 py-1.5 rounded-lg border border-emerald-200 shadow-2xs mt-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Merchant verified ✓</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 2B. CLIENT BUSINESS AUTHORIZATION */
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Request merchant authorization</h3>
                    <p className="text-xs text-gray-600">
                      Specify the merchant details to dispatch an authorization request to their ABA Mobile app.
                    </p>
                  </div>

                  {!authSent ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Merchant Business Name</label>
                        <input
                          type="text"
                          value={clientMerchantName}
                          onChange={e => setClientMerchantName(e.target.value)}
                          className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 font-medium"
                          placeholder="e.g. Henry Stores Co., Ltd."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-700">Merchant Contact Email</label>
                          <input
                            type="email"
                            value={clientMerchantEmail}
                            onChange={e => setClientMerchantEmail(e.target.value)}
                            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 font-medium"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-700">Merchant Phone Number</label>
                          <input
                            type="tel"
                            value={clientMerchantPhone}
                            onChange={e => setClientMerchantPhone(e.target.value)}
                            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthSent(true);
                          addToast('Authorization Sent', `Sent request to ${clientMerchantEmail}`, 'info');
                        }}
                        className="mt-2 py-2.5 px-4 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                        style={{ backgroundColor: '#00B4CC' }}
                      >
                        Send authorization request
                      </button>
                    </div>
                  ) : !isMerchantApproved ? (
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col items-center text-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg animate-pulse">
                        ⏳
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Waiting for merchant approval</h4>
                        <p className="text-xs text-gray-600 mt-1 max-w-md leading-relaxed">
                          The merchant must approve this production request from ABA Mobile before you can access their business and outlet information.
                        </p>
                      </div>

                      <div className="w-full pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMerchantApproved(true);
                            addToast('Merchant Approved', 'Henry Stores Co. authorized integration', 'success');
                          }}
                          className="w-full py-2.5 px-4 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 rounded-lg transition-colors border border-amber-400 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>⚡ Simulate merchant approval</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-300">
                        <Check className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-emerald-950">Merchant verified</h4>
                        <p className="text-xs text-emerald-800 mt-1 max-w-md leading-relaxed">
                          Your client&apos;s identity and ABA account details have been verified through ABA Mobile.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-white px-3.5 py-1.5 rounded-lg border border-emerald-200 shadow-2xs mt-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Merchant verified ✓</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={submitterType === 'own' ? !isAbaAccountVerified : !isMerchantApproved}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  <span>Continue to Business &amp; Outlet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 3: BUSINESS & OUTLET ==================== */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              {!isCreatingNewBusiness ? (
                /* MAIN EXISTING BUSINESS PATH */
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Select business and outlet</h3>
                    <p className="text-xs text-gray-500">
                      Choose an existing merchant business and outlet, or create a new business profile for this production request.
                    </p>
                  </div>

                  {businessFormError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{businessFormError}</span>
                    </div>
                  )}

                  {businesses.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center flex flex-col items-center justify-center gap-3 bg-gray-50/50">
                      <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">No eligible business found</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm">
                          Add a new business profile to continue your production request.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartNewBusiness}
                        className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs cursor-pointer"
                        style={{ backgroundColor: '#00B4CC' }}
                      >
                        + Add new business
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="text-xs font-semibold text-gray-700">Registered Business Profiles:</div>

                      {businesses.map(biz => {
                        const isBizSelected = selectedBusinessId === biz.id;
                        return (
                          <div
                            key={biz.id}
                            className={`border rounded-xl overflow-hidden transition-all ${
                              isBizSelected ? 'border-[#00B4CC] shadow-xs' : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div
                              onClick={() => {
                                setSelectedBusinessId(biz.id);
                                const firstEligible = biz.outlets.find(o => o.eligible);
                                if (firstEligible) {
                                  setSelectedOutletId(firstEligible.id);
                                }
                              }}
                              className={`px-4 py-3 flex items-center justify-between cursor-pointer ${
                                isBizSelected ? 'bg-cyan-50/60 border-b border-cyan-100' : 'bg-gray-50 border-b border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm shadow-2xs">
                                  🏢
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-gray-900">{biz.name}</span>
                                    {biz.isNew && (
                                      <span className="text-[9px] font-bold text-cyan-700 bg-cyan-100 px-1.5 py-0.2 rounded">
                                        Newly Added
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-500 block">
                                    {biz.category || 'Retail & Merchant Services'} • {biz.address}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                Authorized Entity
                              </span>
                            </div>

                            {/* Outlets for selected business */}
                            {isBizSelected && (
                              <div className="p-3.5 flex flex-col gap-2 bg-white">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                  Select Outlet for QR API:
                                </div>

                                {biz.outlets.map(outlet => {
                                  const isOutletSelected = selectedOutletId === outlet.id;

                                  if (!outlet.eligible) {
                                    return (
                                      <div
                                        key={outlet.id}
                                        className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 text-xs flex items-center justify-between opacity-60 cursor-not-allowed"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <input type="radio" disabled checked={false} />
                                          <div>
                                            <span className="text-gray-500 line-through font-medium">{outlet.name}</span>
                                            <span className="text-[10px] text-gray-400 block">{outlet.location}</span>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                          {outlet.disabledReason || 'QR API already enabled'}
                                        </span>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div
                                      key={outlet.id}
                                      onClick={() => setSelectedOutletId(outlet.id)}
                                      className={`p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                        isOutletSelected
                                          ? 'border-[#00B4CC] bg-cyan-50/50 font-semibold shadow-2xs'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <input
                                          type="radio"
                                          checked={isOutletSelected}
                                          onChange={() => setSelectedOutletId(outlet.id)}
                                          className="text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <div>
                                          <span className="text-gray-900">{outlet.name}</span>
                                          <span className="text-[10px] text-gray-500 block font-normal">{outlet.location}</span>
                                        </div>
                                      </div>
                                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                        Eligible
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Button to enter nested new business creation subflow */}
                      <button
                        type="button"
                        onClick={handleStartNewBusiness}
                        className="py-2.5 px-4 text-xs font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50/50 hover:bg-cyan-50 border border-dashed border-cyan-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
                      >
                        <Building2 className="w-4 h-4 text-cyan-600" />
                        <span>+ Add new business</span>
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5"
                      style={{ backgroundColor: '#00B4CC' }}
                    >
                      <span>Continue to Documents</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* NESTED BUSINESS CREATION SUBFLOW (INSIDE STEP 3) */
                <div className="flex flex-col gap-4">
                  {/* Subtle Local Substep Progress Indicator */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                          Add New Business Profile
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelNewBusiness}
                        className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-[10px] font-medium text-center">
                      <div className={`py-1 rounded ${newBusinessSubstep === 'settlement' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-200/80 text-slate-600'}`}>
                        A. Settlement
                      </div>
                      <div className={`py-1 rounded ${newBusinessSubstep === 'details' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-200/80 text-slate-600'}`}>
                        B. Store &amp; Patent
                      </div>
                      <div className={`py-1 rounded ${newBusinessSubstep === 'profile' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-200/80 text-slate-600'}`}>
                        C. Profile
                      </div>
                      <div className={`py-1 rounded ${newBusinessSubstep === 'review' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-200/80 text-slate-600'}`}>
                        D. Confirm
                      </div>
                    </div>
                  </div>

                  {businessFormError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{businessFormError}</span>
                    </div>
                  )}

                  {/* SUBSTEP A: SETTLEMENT ACCOUNTS */}
                  {newBusinessSubstep === 'settlement' && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Select settlement accounts</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Choose the ABA accounts where payments for this business should settle.
                        </p>
                      </div>

                      <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                        <CreditCard className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Dual Currency Support (KHR &amp; USD):</span>
                          <span className="block text-[11px] text-blue-800 mt-0.5">
                            PayWay QR API supports customer payments in both Khmer Riel and US Dollars. Select verified ABA accounts for each currency.
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {/* KHR Settlement Account */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            KHR settlement account
                          </label>
                          <select
                            value={newKhrAccount}
                            onChange={e => setNewKhrAccount(e.target.value)}
                            className="px-3 py-2.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-cyan-500 font-medium"
                          >
                            {ABA_KHR_ACCOUNTS.map(acc => (
                              <option key={acc} value={acc}>
                                {acc}
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] text-gray-400">Verified ABA Bank Merchant KHR Account</span>
                        </div>

                        {/* USD Settlement Account */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-500" />
                            USD settlement account
                          </label>
                          <select
                            value={newUsdAccount}
                            onChange={e => setNewUsdAccount(e.target.value)}
                            className="px-3 py-2.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-cyan-500 font-medium"
                          >
                            {ABA_USD_ACCOUNTS.map(acc => (
                              <option key={acc} value={acc}>
                                {acc}
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] text-gray-400">Verified ABA Bank Merchant USD Account</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBSTEP B: STORE NAME & PATENT */}
                  {newBusinessSubstep === 'details' && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Store name and patent</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Enter the business and outlet names and attach your patent / business registration.
                        </p>
                      </div>

                      {/* Store Name */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-gray-700">Store name</label>
                          <span className="text-[10px] text-gray-400">{newStoreName.length}/50 chars</span>
                        </div>
                        <input
                          type="text"
                          maxLength={50}
                          value={newStoreName}
                          onChange={e => setNewStoreName(e.target.value)}
                          placeholder="e.g. Mondulkiri Specialty Coffee"
                          className="px-3 py-2.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-cyan-500 font-medium"
                        />
                        <span className="text-[10px] text-gray-500">
                          Enter the business name customers should see when making a payment.
                        </span>
                      </div>

                      {/* Outlet Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Outlet name</label>
                        <input
                          type="text"
                          value={newOutletName}
                          onChange={e => setNewOutletName(e.target.value)}
                          placeholder="e.g. Main Branch (BKK1)"
                          className="px-3 py-2.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-cyan-500 font-medium"
                        />
                      </div>

                      {/* Patent / Business Registration File */}
                      <div className="flex flex-col gap-2 pt-1">
                        <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                          <span>Patent / business registration</span>
                          {newPatentFile && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Attached ✓
                            </span>
                          )}
                        </label>

                        {!newPatentFile ? (
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col items-center text-center gap-2">
                            <FileSpreadsheet className="w-7 h-7 text-gray-400" />
                            <div>
                              <span className="text-xs font-medium text-gray-700 block">
                                Attach official Tax Patent or Business Registration
                              </span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">PDF, PNG, or JPG (max 10MB)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNewPatentFile('Tax_Patent_Mondulkiri_2026.pdf');
                                addToast('Document Attached', 'Tax Patent Certificate attached', 'info');
                              }}
                              className="mt-1 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Attach Patent Document</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 border border-emerald-200 bg-emerald-50/50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-mono font-medium text-emerald-800">{newPatentFile}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setNewPatentFile('Updated_Tax_Patent_2026.pdf')}
                                className="p-1 text-slate-500 hover:text-slate-800 text-[11px] hover:underline cursor-pointer"
                              >
                                Replace
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => setNewPatentFile(null)}
                                className="p-1 text-red-500 hover:text-red-700 text-[11px] hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUBSTEP C: LOGO, CATEGORY & ADDRESS */}
                  {newBusinessSubstep === 'profile' && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Business profile</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Set the customer-facing logo, merchant business category, and store address.
                        </p>
                      </div>

                      {/* Business Logo */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-700">Business Logo</label>
                        <p className="text-[11px] text-gray-500">
                          This logo can appear to customers during PayWay payment experiences once the business is approved.
                        </p>
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          {SAMPLE_LOGOS.map(logo => {
                            const isSelected = newLogoId === logo.id;
                            return (
                              <button
                                key={logo.id}
                                type="button"
                                onClick={() => setNewLogoId(logo.id)}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                                  isSelected ? 'border-[#00B4CC] bg-cyan-50/50 shadow-xs' : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              >
                                <span className="text-2xl">{logo.icon}</span>
                                <span className="text-[10px] font-semibold text-gray-700">{logo.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Business Category */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Business Category</label>
                        <select
                          value={newCategory}
                          onChange={e => setNewCategory(e.target.value)}
                          className="px-3 py-2.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-cyan-500 font-medium"
                        >
                          {BUSINESS_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Store Address */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Store Address</label>
                        <textarea
                          rows={2}
                          value={newAddress}
                          onChange={e => setNewAddress(e.target.value)}
                          placeholder="Street address, Sangkat, Khan, City"
                          className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-cyan-500 font-medium resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* SUBSTEP D: REVIEW BUSINESS PROFILE */}
                  {newBusinessSubstep === 'review' && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Review business profile</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Check the business details before adding it to your production request.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 text-xs">
                        {/* Store name */}
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <div>
                            <span className="text-slate-500 text-[11px] block">Store &amp; Outlet</span>
                            <span className="font-bold text-slate-900">{newStoreName} ({newOutletName})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewBusinessSubstep('details')}
                            className="text-cyan-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        </div>

                        {/* Settlement accounts */}
                        <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                          <div>
                            <span className="text-slate-500 text-[11px] block">Settlement Accounts</span>
                            <span className="text-slate-900 font-medium block">KHR: {newKhrAccount}</span>
                            <span className="text-slate-900 font-medium block">USD: {newUsdAccount}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewBusinessSubstep('settlement')}
                            className="text-cyan-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        </div>

                        {/* Patent */}
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <div>
                            <span className="text-slate-500 text-[11px] block">Patent / Business Registration</span>
                            <span className="font-mono text-emerald-700 font-medium">📄 {newPatentFile}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewBusinessSubstep('details')}
                            className="text-cyan-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        </div>

                        {/* Profile Info */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-slate-500 text-[11px] block">Category &amp; Address</span>
                            <span className="text-slate-900 font-medium block">{newCategory}</span>
                            <span className="text-slate-600 text-[11px] block mt-0.5">{newAddress}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewBusinessSubstep('profile')}
                            className="text-cyan-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subflow Navigation Footer */}
                  <div className="flex justify-between gap-2 pt-3 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={handleNewBusinessPrevSubstep}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    {newBusinessSubstep !== 'review' ? (
                      <button
                        type="button"
                        onClick={handleNewBusinessNextSubstep}
                        className="px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5"
                        style={{ backgroundColor: '#00B4CC' }}
                      >
                        <span>Next substep</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConfirmCreateBusiness}
                        className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-sm hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5"
                        style={{ backgroundColor: '#00B4CC' }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Add business</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP 4: DOCUMENTS ==================== */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Business documents</h3>
                <p className="text-xs text-gray-500">
                  Provide the business information PayWay needs to review this production request.
                </p>
              </div>

              {highlightedMissingDoc && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    <strong>Required Action:</strong> Please attach <strong>{highlightedMissingDoc}</strong> before continuing to Review.
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3.5">
                {/* Document 1: Patent / Business Licence */}
                <div className={`p-4 border rounded-xl flex flex-col gap-2 transition-all ${
                  highlightedMissingDoc?.includes('Patent') ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-200' : 'border-gray-200 bg-gray-50/50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">1. Patent / Tax Registration Certificate</span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        Official valid tax patent certificate for merchant entity identification and compliance.
                      </span>
                    </div>
                    {activePatentDoc ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                        Attached ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full shrink-0">
                        Optional for KHQR
                      </span>
                    )}
                  </div>
                  {!activePatentDoc ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedPatent('Tax_Patent_Certificate_2026.pdf');
                        addToast('Document Attached', 'Tax Patent Certificate attached', 'info');
                      }}
                      className="py-1.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-xs text-gray-700 font-medium rounded-lg cursor-pointer self-start flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Tax Patent</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-mono font-medium pt-1">
                      <span>📄 {activePatentDoc}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedPatent(null);
                          if (currentBusiness) currentBusiness.patentFileName = undefined;
                        }}
                        className="text-gray-400 hover:text-red-600 text-[11px] font-sans hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Document 2: MOC Certificate */}
                <div className={`p-4 border rounded-xl flex flex-col gap-2 transition-all ${
                  highlightedMissingDoc?.includes('MOC') ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-200' : 'border-gray-200 bg-gray-50/50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">2. Ministry of Commerce (MOC) Certificate</span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        Business Registration Certificate issued by the Ministry of Commerce.
                      </span>
                    </div>
                    {uploadedMoc ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                        Attached ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        Standard
                      </span>
                    )}
                  </div>
                  {!uploadedMoc ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedMoc('MOC_Registration_Certificate_2026.pdf');
                        addToast('Document Attached', 'MOC Registration Certificate attached', 'info');
                      }}
                      className="py-1.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-xs text-gray-700 font-medium rounded-lg cursor-pointer self-start flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload MOC Certificate</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-mono font-medium pt-1">
                      <span>📄 {uploadedMoc}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedMoc(null)}
                        className="text-gray-400 hover:text-red-600 text-[11px] font-sans hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Identity Verification Notice */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 leading-relaxed">
                    <strong className="font-semibold block text-emerald-950">Identity verification already complete</strong>
                    Personal identity documents (Passport / National ID) are not required. Identity and account authorization are already verified through ABA Mobile.
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  <span>Continue to Payment Methods</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 5: PAYMENT METHODS ==================== */}
          {step === 5 && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Select payment methods</h3>
                <p className="text-xs text-gray-500">
                  Choose the payment methods you want to enable for this QR API integration.
                </p>
              </div>

              {paymentMethodError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{paymentMethodError}</span>
                </div>
              )}

              {/* Blocking Notification when extra documents are required for international schemes */}
              {missingDocWarning && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col gap-2.5 text-xs text-amber-900 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-950">Additional document required</h4>
                      <p className="text-amber-800 mt-0.5">
                        One or more selected payment methods require additional business documentation.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const missing = getMissingAdditionalDocuments(selectedMethods);
                        setHighlightedMissingDoc(missing[0] || 'MOC Registration Certificate');
                        setStep(4); // Route back to Step 4 Documents
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Add document</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Method Cards */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* 1. KHQR (National QR payment - Fully Toggleable) */}
                <div
                  onClick={() => togglePaymentMethod('KHQR')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedMethods.includes('KHQR')
                      ? 'border-[#00B4CC] bg-cyan-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#E1251B] text-white flex items-center justify-center font-black text-[10px] shadow-2xs">
                      KHQR
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">KHQR</span>
                      <span className="text-[10px] text-gray-500">National QR payment</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes('KHQR')}
                    onChange={() => {}}
                    className="text-cyan-600 rounded focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 2. ABA PAY (Pay with ABA Mobile - Fully Toggleable) */}
                <div
                  onClick={() => togglePaymentMethod('ABA PAY')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedMethods.includes('ABA PAY')
                      ? 'border-[#00B4CC] bg-cyan-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#005A9C] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                      ABA
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">ABA PAY</span>
                      <span className="text-[10px] text-gray-500">Pay with ABA Mobile</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes('ABA PAY')}
                    onChange={() => {}}
                    className="text-cyan-600 rounded focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 3. WeChat Pay */}
                <div
                  onClick={() => togglePaymentMethod('WeChat Pay')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedMethods.includes('WeChat Pay')
                      ? 'border-[#00B4CC] bg-cyan-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#07C160] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                      WX
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">WeChat Pay</span>
                      <span className="text-[10px] text-gray-500">International QR</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes('WeChat Pay')}
                    onChange={() => {}}
                    className="text-cyan-600 rounded focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 4. Alipay */}
                <div
                  onClick={() => togglePaymentMethod('Alipay')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedMethods.includes('Alipay')
                      ? 'border-[#00B4CC] bg-cyan-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#1677FF] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                      ALI
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">Alipay</span>
                      <span className="text-[10px] text-gray-500">International QR</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes('Alipay')}
                    onChange={() => {}}
                    className="text-cyan-600 rounded focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={selectedMethods.length === 0}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  <span>Continue to Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 6: REVIEW ==================== */}
          {step === 6 && (
            <form onSubmit={handleFinalSubmit} className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Review application</h3>
                <p className="text-xs text-gray-500">
                  Verify your production setup summary before submitting your request for PayWay review.
                </p>
              </div>

              {/* Summary Table Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3 text-xs">
                {/* 1. Submitter */}
                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Submitter:</span>
                  <span className="font-bold text-gray-900">
                    {submitterType === 'own' ? 'Merchant (My own business)' : `Developer on behalf (${currentBusiness?.name})`}
                  </span>
                </div>

                {/* 2. Merchant Verification */}
                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Merchant verification:</span>
                  <span className="font-semibold text-emerald-600">✓ Complete (ABA Mobile)</span>
                </div>

                {/* 3. Business & Outlet */}
                <div className="flex justify-between items-start border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Business &amp; Outlet:</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 block">{currentBusiness?.name}</span>
                    <span className="text-[11px] text-gray-500 block">{currentOutlet?.name} ({currentOutlet?.location})</span>
                    {currentBusiness?.category && (
                      <span className="text-[10px] text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200 inline-block mt-0.5">
                        {currentBusiness.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Settlement Accounts */}
                <div className="flex justify-between items-start border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Settlement accounts:</span>
                  <div className="text-right">
                    <span className="text-gray-900 font-medium block">
                      KHR: {currentBusiness?.khrAccount || '001 234 567 (KHR)'}
                    </span>
                    <span className="text-gray-900 font-medium block">
                      USD: {currentBusiness?.usdAccount || '001 234 568 (USD)'}
                    </span>
                  </div>
                </div>

                {/* 5. Business Documents */}
                <div className="flex justify-between items-start border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Business documents:</span>
                  <div className="text-right flex flex-col gap-0.5">
                    <span className="text-emerald-600 font-semibold">
                      Patent: {activePatentDoc ? 'Attached ✓' : 'Not required'}
                    </span>
                    <span className={`text-[11px] ${uploadedMoc ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                      MOC: {uploadedMoc ? 'Attached ✓' : 'Not required'}
                    </span>
                  </div>
                </div>

                {/* 6. Payment Methods */}
                <div className="flex justify-between items-center border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Payment methods:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-700">{selectedMethods.join(', ')}</span>
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="text-[11px] text-cyan-700 hover:underline font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* 7. Technical Requirements */}
                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Technical requirements:</span>
                  <span className="font-semibold text-emerald-600">✓ Complete (5/5 verified)</span>
                </div>

                {/* 8. UI Evidence */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">UI evidence:</span>
                  <span className="font-semibold text-emerald-600">
                    ✓ Screen recording &amp; screenshot attached
                  </span>
                </div>
              </div>

              {/* Review Timeline Notice */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Notice:</strong> PayWay will review your integration and business documentation before issuing production credentials. Reviews usually take 2 to 3 working days. Your Sandbox workspace remains fully active.
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl">
                <input
                  type="checkbox"
                  checked={confirmedAuth}
                  onChange={e => setConfirmedAuth(e.target.checked)}
                  className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 shrink-0 cursor-pointer"
                />
                <span className="leading-snug">
                  I confirm that the information provided is correct and I am authorized to submit this production request.
                </span>
              </label>

              <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={!confirmedAuth}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-700"
                >
                  Request production access
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
