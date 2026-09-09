import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  FileText,
  X,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { CollegeProfile, AdminCredentials, CollegeSetupPayload } from '../types';

interface InstitutionalSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCollege: CollegeProfile;
  onCompleteSetup: (payload: CollegeSetupPayload) => Promise<void>;
  isFirstTime?: boolean;
}

export const InstitutionalSetupModal: React.FC<InstitutionalSetupModalProps> = ({
  isOpen,
  onClose,
  currentCollege,
  onCompleteSetup,
  isFirstTime = false,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: College Info State
  const [collegeName, setCollegeName] = useState(currentCollege.name || '');
  const [accreditation, setAccreditation] = useState(currentCollege.accreditation || 'Affiliated to State Technical University | NAAC A+ Accredited | Autonomous');
  const [collegeCode, setCollegeCode] = useState(currentCollege.code || 'COL-INST-2026');
  const [address, setAddress] = useState(currentCollege.address || 'Academic Enclave Campus, University Boulevard');
  const [bursarEmail, setBursarEmail] = useState(currentCollege.bursarEmail || 'bursar@institution.edu.in');
  const [bursarPhone, setBursarPhone] = useState(currentCollege.bursarPhone || '+91 98450 12345');
  const [academicYear, setAcademicYear] = useState(currentCollege.academicYear || '2025-2026');
  const [currentSemester, setCurrentSemester] = useState(currentCollege.currentSemester || 'Even Semester (Spring 2026)');
  const [currencySymbol, setCurrencySymbol] = useState(currentCollege.currencySymbol || '₹');

  // Step 2: Super Admin Security Credentials
  const [adminName, setAdminName] = useState('Dr. Administrator');
  const [adminDesignation, setAdminDesignation] = useState('Director of Finance & Bursary');
  const [adminEmail, setAdminEmail] = useState('admin@institution.edu.in');
  const [password, setPassword] = useState('Admin@2026#Secure');
  const [confirmPassword, setConfirmPassword] = useState('Admin@2026#Secure');
  const [recoveryPin, setRecoveryPin] = useState('8842');

  // Step 3: Initialization Mode
  const [initMode, setInitMode] = useState<'CLEAN_SLATE' | 'SAMPLE_DATA'>('CLEAN_SLATE');

  if (!isOpen) return null;

  const validateStep1 = () => {
    if (!collegeName.trim()) {
      setErrorMsg('Please enter the official College or Institution Name.');
      return false;
    }
    if (!collegeCode.trim()) {
      setErrorMsg('Please enter the Institution Code or Registration ID.');
      return false;
    }
    if (!bursarEmail.trim()) {
      setErrorMsg('Please enter the Bursar / Accounts Office email address.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const validateStep2 = () => {
    if (!adminName.trim()) {
      setErrorMsg('Please enter the Administrator Name.');
      return false;
    }
    if (!adminEmail.trim()) {
      setErrorMsg('Please enter the Administrator Login Email / Username.');
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Master Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrorMsg(null);
    setStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => (prev - 1) as any);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload: CollegeSetupPayload = {
        collegeProfile: {
          name: collegeName.trim(),
          accreditation: accreditation.trim(),
          code: collegeCode.trim().toUpperCase(),
          address: address.trim(),
          bursarEmail: bursarEmail.trim().toLowerCase(),
          bursarPhone: bursarPhone.trim(),
          academicYear: academicYear.trim(),
          currentSemester: currentSemester.trim(),
          currencySymbol: currencySymbol.trim(),
          currencyCode: 'INR',
          isSetupComplete: true,
        },
        adminCredentials: {
          adminName: adminName.trim(),
          adminEmail: adminEmail.trim().toLowerCase(),
          adminDesignation: adminDesignation.trim(),
          adminRole: 'SUPER_ADMIN',
          password,
          recoveryPin,
        },
        initializationMode: initMode,
      };

      await onCompleteSetup(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize college configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:px-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  {isFirstTime ? 'Institutional First-Time Setup Wizard' : 'Register & Configure College Profile'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Step {step} of 4
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Configure your institution identity, super admin login credentials, and database registers
              </p>
            </div>
          </div>

          {!isFirstTime && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Progress Indicators */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          {[
            { num: 1, label: 'Institution Identity' },
            { num: 2, label: 'Admin Credentials' },
            { num: 3, label: 'Database Setup' },
            { num: 4, label: 'Final Confirmation' },
          ].map((s) => (
            <div 
              key={s.num} 
              className={`flex items-center gap-1.5 font-medium transition ${
                step === s.num 
                  ? 'text-indigo-600 font-bold' 
                  : step > s.num 
                  ? 'text-emerald-600' 
                  : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === s.num 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : step > s.num 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5 bg-white">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: COLLEGE REGISTRATION DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  College & Institutional Identification
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  These details will appear on all printed fee receipts, demand notices, audit ledgers, and student bills.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official College / University Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. St. Xavier's Institute of Technology & Management"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Institutional Code / AISHE Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={collegeCode}
                      onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
                      placeholder="e.g. COL-ENG-560012"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      placeholder="₹ (INR)"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Affiliation & Accreditation Subtitle
                  </label>
                  <input
                    type="text"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    placeholder="e.g. Affiliated to Anna University | NAAC A++ Accredited | Autonomous"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Campus Physical Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Campus Boulevard, Tech Park Road, City - PIN"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Accounts / Bursar Office Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={bursarEmail}
                      onChange={(e) => setBursarEmail(e.target.value)}
                      placeholder="bursar@institution.edu.in"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Accounts Helpline / Phone Number
                    </label>
                    <input
                      type="text"
                      value={bursarPhone}
                      onChange={(e) => setBursarPhone(e.target.value)}
                      placeholder="+91 (080) 2839-4400"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Current Academic Year
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="2025-2026"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Current Active Semester
                    </label>
                    <input
                      type="text"
                      value={currentSemester}
                      onChange={(e) => setCurrentSemester(e.target.value)}
                      placeholder="Even Semester (Spring 2026)"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SUPER ADMIN & SECURITY SETUP */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Super Administrator Account & Security Credentials
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set up your master administrative identity with permissions to approve scholarships, issue waivers, audit accounts, and manage institutional settings.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Administrator Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Dr. Rajeshwari Kumar"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Official Designation
                    </label>
                    <input
                      type="text"
                      value={adminDesignation}
                      onChange={(e) => setAdminDesignation(e.target.value)}
                      placeholder="e.g. Director of Finance & Bursary"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Master Login ID / Official Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@institution.edu.in"
                      className="w-full px-3.5 py-2.5 pl-9 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">This email/ID will be used as the primary Super Admin profile.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Master Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 pl-9 pr-9 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Confirm Master Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 pl-9 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Emergency Ledger Recovery PIN (4–6 Digits)
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="text"
                      maxLength={6}
                      value={recoveryPin}
                      onChange={(e) => setRecoveryPin(e.target.value)}
                      placeholder="e.g. 8842"
                      className="w-full px-3.5 py-2 pl-9 rounded-lg border border-slate-300 font-mono text-xs tracking-widest focus:ring-2 focus:ring-indigo-500"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Used to authorize manual ledger unlocks and database restores.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DATABASE INITIALIZATION MODE */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  Select Database Initialization Mode
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Decide how you want the server ledger initialized when installed on this machine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option 1: Clean Slate */}
                <div
                  onClick={() => setInitMode('CLEAN_SLATE')}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                    initMode === 'CLEAN_SLATE'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      {initMode === 'CLEAN_SLATE' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">Clean Institutional Slate</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Starts with a pristine, empty ledger: <strong>0 students, 0 receipts, 0 expenses</strong>.
                    </p>
                    <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4 pt-1">
                      <li>Ready for authentic student admissions</li>
                      <li>Official receipts starting from #RCP-0001</li>
                      <li>Genesis cryptographic SHA-256 seal established</li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center text-xs font-semibold text-indigo-700">
                    <span>Selected for New College Deployment</span>
                  </div>
                </div>

                {/* Option 2: Sample Data */}
                <div
                  onClick={() => setInitMode('SAMPLE_DATA')}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                    initMode === 'SAMPLE_DATA'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">Guided Demonstration Data</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Includes 8 pre-populated student ledgers, simulated receipts, and expenditure logs.
                    </p>
                    <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4 pt-1">
                      <li>Ideal for staff onboarding & Bursar training</li>
                      <li>Pre-loaded fee structures and charts</li>
                      <li>College name and admin identity still customized to yours</li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center text-xs font-semibold text-slate-600">
                    <span>Good for Evaluation & Testing</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: FINAL CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Review Registration & Initialize System
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your institutional parameters. Upon clicking "Register & Launch", the server database and administrator profile will be initialized.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Registered College Name:</span>
                    <span className="font-bold text-slate-900 text-sm">{collegeName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Institution Code:</span>
                    <span className="font-mono font-bold text-slate-800">{collegeCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Campus Location:</span>
                    <span className="text-slate-800">{address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Bursar Office Helpline:</span>
                    <span className="text-slate-800">{bursarPhone} ({bursarEmail})</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Super Administrator:</span>
                    <span className="font-bold text-slate-900">{adminName} ({adminDesignation})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Login Email / Username:</span>
                    <span className="font-mono text-slate-800 font-semibold">{adminEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Database Genesis Mode:</span>
                    <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                      initMode === 'CLEAN_SLATE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {initMode === 'CLEAN_SLATE' ? 'Clean Slate (0 Records - Production Ready)' : 'Sample Training Records'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Security Seal:</span>
                    <span className="text-emerald-700 font-medium">SHA-256 Tamper Sealed Master Chain</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
            ) : (
              !isFirstTime && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
              )
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Initializing Institutional Ledger...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Setup & Launch College Portal
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
