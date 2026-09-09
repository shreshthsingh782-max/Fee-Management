import React, { useState } from 'react';
import { Student, PaymentMode, Receipt, PaymentRecord } from '../types';
import { BANK_PORTALS, COLLEGE_INFO } from '../data/mockData';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  ShieldCheck, 
  X, 
  CreditCard, 
  Smartphone, 
  Landmark, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  ArrowRight,
  Lock,
  RefreshCw
} from 'lucide-react';

interface BankingPortalModalProps {
  student: Student;
  onClose: () => void;
  onPaymentSuccess: (updatedStudent: Student, newReceipt: Receipt) => void;
}

export const BankingPortalModal: React.FC<BankingPortalModalProps> = ({
  student,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedPortalId, setSelectedPortalId] = useState<string>('sbi-edupay');
  const [paymentAmount, setPaymentAmount] = useState<number>(student.pendingDue > 0 ? student.pendingDue : student.totalFee);
  const [customAmountActive, setCustomAmountActive] = useState<boolean>(false);
  const [step, setStep] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  
  // Specific payment gateway fields
  const [upiId, setUpiId] = useState<string>(`${student.rollNo.toLowerCase()}@okhdfcbank`);
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvv, setCardCvv] = useState<string>('724');
  const [selectedBankNetbanking, setSelectedBankNetbanking] = useState<string>('State Bank of India');
  const [challanRef, setChallanRef] = useState<string>(`CHAL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [processingStatusText, setProcessingStatusText] = useState<string>('Connecting to Institutional Banking Gateway...');

  const selectedPortal = BANK_PORTALS.find((p) => p.id === selectedPortalId) || BANK_PORTALS[0];

  const handleStartPayment = () => {
    if (paymentAmount <= 0) return;
    setStep('PROCESSING');

    // Simulate multi-step bank gateway authentication
    setProcessingStatusText(`Establishing 256-bit SSL handshake with ${selectedPortal.name}...`);

    setTimeout(() => {
      setProcessingStatusText('Validating Student Account & Institutional Fee Ledger...');
    }, 900);

    setTimeout(() => {
      setProcessingStatusText('Awaiting Banking Gateway Authorization & Clearing Callback...');
    }, 1800);

    setTimeout(() => {
      finalizeTransaction();
    }, 2800);
  };

  const finalizeTransaction = () => {
    // Generate transaction references
    const timestamp = Date.now();
    const transactionRef = `${selectedPortal.code}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const receiptNumber = `REC-2026-${student.department.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    // Determine payment mode enum
    let paymentMode: PaymentMode = 'NET_BANKING';
    if (selectedPortal.type === 'UPI') paymentMode = 'UPI';
    else if (selectedPortal.type === 'CHALLAN') paymentMode = 'NEFT_RTGS';
    else if (selectedPortal.id === 'razorpay-campus') paymentMode = 'DEBIT_CREDIT_CARD';

    // Calculate new student balances
    const newPaidAmount = student.paidAmount + paymentAmount;
    const newPendingDue = Math.max(0, student.totalFee - newPaidAmount);
    const newStatus = newPendingDue === 0 ? 'CLEARED' : 'PARTIAL';

    const newPaymentRecord: PaymentRecord = {
      id: `PAY-${timestamp}`,
      studentId: student.id,
      receiptNumber,
      amount: paymentAmount,
      date: today,
      paymentMode,
      bankName: selectedPortal.name,
      transactionRef,
      status: 'SUCCESS',
      remarks: `Online portal payment via ${selectedPortal.name}`,
    };

    const updatedStudent: Student = {
      ...student,
      paidAmount: newPaidAmount,
      pendingDue: newPendingDue,
      status: newStatus,
      paymentHistory: [newPaymentRecord, ...student.paymentHistory],
      qrToken: `AUTH_STU_${student.rollNo}_${newPendingDue}_${newStatus}_METRO2026`,
    };

    const newReceipt: Receipt = {
      receiptNumber,
      date: today,
      studentId: student.id,
      rollNo: student.rollNo,
      studentName: student.name,
      degreeProgram: student.degreeProgram,
      department: student.department,
      semester: student.semester,
      academicYear: student.academicYear,
      items: student.feeItems,
      subtotal: student.totalFee,
      scholarshipDiscount: student.scholarshipQuota?.includes('Waiver') ? 10000 : 0,
      lateFee: student.status === 'OVERDUE' ? 500 : 0,
      totalAmount: student.totalFee,
      amountPaidNow: paymentAmount,
      balanceRemaining: newPendingDue,
      paymentMode,
      transactionRef,
      bankName: selectedPortal.name,
      authorizedBy: 'Automated Banking Gateway Clearing (SBI/HDFC Core Switch)',
      digitalSealVerified: true,
      status: 'PAID',
    };

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Safe fallback
    }

    setStep('SUCCESS');
    setTimeout(() => {
      onPaymentSuccess(updatedStudent, newReceipt);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-4 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs">
              <Landmark className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Institutional Banking Payment Gateway</h3>
              <p className="text-[10px] text-slate-500">Authorized Degree College Payment Switch • 256-bit Encrypted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {step === 'SELECT' && (
          <div className="p-4 space-y-3.5">
            {/* Student & Fee Snapshot */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
              <div>
                <span className="text-[9px] font-bold tracking-wider uppercase text-blue-700">Student Account</span>
                <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                <p className="text-[11px] text-slate-600">
                  Roll: <span className="font-mono font-semibold text-slate-800">{student.rollNo}</span> • {student.degreeProgram} (Sem {student.semester})
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500">Current Outstanding Due</span>
                <div className="text-base font-mono font-bold text-slate-900">
                  ₹{student.pendingDue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500">
                  Total Assessed: ₹{student.totalFee.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Payment Amount Selection */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Payment Amount (INR)
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomAmountActive(false);
                    setPaymentAmount(student.pendingDue > 0 ? student.pendingDue : student.totalFee);
                  }}
                  className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                    !customAmountActive
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-[11px] font-semibold text-slate-600">Full Outstanding Balance</span>
                  <span className="block text-sm font-mono font-bold text-slate-900 mt-0.5">
                    ₹{(student.pendingDue > 0 ? student.pendingDue : student.totalFee).toLocaleString('en-IN')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomAmountActive(true);
                    setPaymentAmount(Math.round((student.pendingDue > 0 ? student.pendingDue : student.totalFee) / 2));
                  }}
                  className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                    customAmountActive
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-[11px] font-semibold text-slate-600">Installment / Custom Amount</span>
                  <span className="block text-sm font-mono font-bold text-slate-900 mt-0.5">
                    Partial Payment
                  </span>
                </button>
              </div>

              {customAmountActive && (
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                  <input
                    type="number"
                    min={500}
                    max={student.pendingDue > 0 ? student.pendingDue : student.totalFee}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-6 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter installment amount"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Minimum installment ₹500. Remaining balance carried forward to collegiate ledger.
                  </p>
                </div>
              )}
            </div>

            {/* Select Banking Portal / Gateway */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Select Connected Banking Gateway
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BANK_PORTALS.map((portal) => {
                  const isSelected = selectedPortalId === portal.id;
                  return (
                    <div
                      key={portal.id}
                      onClick={() => setSelectedPortalId(portal.id)}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition flex items-start gap-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-1.5 rounded ${portal.logoColor} shrink-0 shadow-2xs`}>
                        {portal.type === 'UPI' ? (
                          <Smartphone className="w-3.5 h-3.5" />
                        ) : portal.type === 'CHALLAN' ? (
                          <FileText className="w-3.5 h-3.5" />
                        ) : (
                          <Landmark className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">{portal.name}</span>
                          {portal.popular && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                              INSTANT
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          {portal.type === 'UPI'
                            ? 'Google Pay, PhonePe, Paytm, BHIM'
                            : portal.type === 'CHALLAN'
                            ? 'Physical/NEFT Bank Branch Challan'
                            : 'Corporate & Retail NetBanking'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Gateway Detail Configuration */}
            {selectedPortal.type === 'UPI' && (
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                    Instant UPI Payment QR
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-800">
                    UPI ID: collegefees@sbi
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-0.5">
                  <div className="p-1.5 bg-white rounded border border-emerald-300 shadow-2xs shrink-0">
                    <QRCodeSVG
                      value={`upi://pay?pa=bursar.metroadmin@sbi&pn=${encodeURIComponent(COLLEGE_INFO.name)}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(student.rollNo)}`}
                      size={90}
                      level="M"
                    />
                  </div>
                  <div className="text-xs space-y-1 text-slate-700 flex-1">
                    <p className="font-semibold text-slate-900 text-xs">Scan using any UPI App</p>
                    <p className="text-[10px] text-slate-600">
                      GPay, PhonePe, Paytm, CRED or scan via college mobile app. Instant verification upon scan.
                    </p>
                    <div className="pt-1">
                      <label className="text-[10px] text-slate-600 block">Or enter Student UPI ID / VPA:</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full mt-0.5 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                        placeholder="e.g. rollnumber@okhdfcbank"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPortal.type === 'NET_BANKING' && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Select Account Bank:</label>
                <select
                  value={selectedBankNetbanking}
                  onChange={(e) => setSelectedBankNetbanking(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800"
                >
                  <option value="State Bank of India">State Bank of India (SBI EduCollect)</option>
                  <option value="HDFC Bank">HDFC Bank SmartHub</option>
                  <option value="ICICI Bank">ICICI Bank Corporate & Retail</option>
                  <option value="Axis Bank">Axis Bank HigherEd Portal</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                  <option value="Canara Bank">Canara Bank Institutional</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  You will be securely routed to {selectedBankNetbanking}'s 2FA authentication gateway.
                </p>
              </div>
            )}

            {selectedPortal.type === 'CHALLAN' && (
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-900">Beneficiary Virtual Account:</span>
                  <span className="font-mono font-bold text-slate-800">MADC{student.rollNo}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Virtual IFSC Code:</span>
                  <span className="font-mono font-semibold text-slate-800">SBIN0040921</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Challan Ref No:</span>
                  <span className="font-mono font-bold text-blue-900">{challanRef}</span>
                </div>
                <p className="text-[10px] text-amber-800 pt-0.5">
                  Transfer via RTGS/NEFT or counter cash at any authorized bank branch using this challan.
                </p>
              </div>
            )}

            {/* Security Guarantee banner */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                RBI Regulated Collegiate Escrow Clearing Switch. No payment gateway convenience fee for students.
              </span>
            </div>

            {/* Bottom Pay Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block">Total Payable Now</span>
                <span className="text-lg font-mono font-bold text-blue-950">
                  ₹{paymentAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded transition shadow-xs cursor-pointer"
                >
                  <span>Authorize & Pay ₹{paymentAmount.toLocaleString('en-IN')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {step === 'PROCESSING' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-3 border-blue-100 border-t-blue-700 animate-spin flex items-center justify-center">
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Landmark className="w-6 h-6 text-blue-800" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-base font-bold text-slate-900">Processing Interbank Clearance</h4>
              <p className="text-xs font-medium text-blue-700 animate-pulse">{processingStatusText}</p>
              <p className="text-[10px] text-slate-500">
                Amount: <span className="font-mono font-bold text-slate-800">₹{paymentAmount.toLocaleString('en-IN')}</span> • Do not refresh or close this browser window.
              </p>
            </div>

            <div className="w-full max-w-xs bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-700 h-1.5 rounded-full animate-[pulse_1s_infinite] w-3/4"></div>
            </div>
          </div>
        )}

        {/* Success State */}
        {step === 'SUCCESS' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-base font-bold text-slate-900">Payment Cleared Successfully!</h4>
              <p className="text-xs text-slate-600">
                Bank transaction verified. Automated collegiate fee receipt is being generated...
              </p>
            </div>
            <div className="text-xs font-mono bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-slate-700">
              Amount Settled: ₹{paymentAmount.toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
