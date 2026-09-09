import React, { useState } from 'react';
import { 
  Student, 
  BankPortal, 
  Receipt, 
  PaymentMode,
  PaymentRecord 
} from '../types';
import { COLLEGE_INFO, BANK_PORTALS } from '../data/mockData';
import { 
  IndianRupee, 
  QrCode, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Receipt as ReceiptIcon, 
  Download, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone,
  ArrowRight
} from 'lucide-react';

interface StudentPortalDashboardProps {
  student: Student;
  onOpenBankingPortal: (student: Student) => void;
  onPaymentSuccess?: (updatedStudent: Student, newReceipt: Receipt) => void;
  onViewReceipt: (receipt: Receipt) => void;
  onShowQRPass?: (student: Student) => void;
  onOpenInstallments?: () => void;
  onOpenScholarships?: () => void;
}

export const StudentPortalDashboard: React.FC<StudentPortalDashboardProps> = ({
  student,
  onOpenBankingPortal,
  onPaymentSuccess,
  onViewReceipt,
  onShowQRPass,
  onOpenInstallments,
  onOpenScholarships,
}) => {
  const [payAmount, setPayAmount] = useState<number>(student.pendingDue);
  const [selectedPortal, setSelectedPortal] = useState<BankPortal>(BANK_PORTALS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const isOverdue = student.status === 'OVERDUE' || student.pendingDue > 0 && new Date(student.dueDate) < new Date();
  const isCleared = student.pendingDue <= 0;

  const handleOpenQR = () => {
    if (onShowQRPass) {
      onShowQRPass(student);
    } else {
      setShowQrModal(true);
    }
  };

  const handlePayNow = () => {
    if (payAmount <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      // Determine payment mode enum
      let paymentMode: PaymentMode = 'NET_BANKING';
      if (selectedPortal.type === 'UPI') paymentMode = 'UPI';
      else if (selectedPortal.type === 'CHALLAN') paymentMode = 'NEFT_RTGS';

      const timestamp = Date.now();
      const transactionRef = `${selectedPortal.code}-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const receiptNumber = `REC-2026-${student.department.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const today = new Date().toISOString().split('T')[0];

      const newPaidAmount = student.paidAmount + payAmount;
      const newPendingDue = Math.max(0, student.totalFee - newPaidAmount);
      const newStatus = newPendingDue === 0 ? 'CLEARED' : 'PARTIAL';

      const newPaymentRecord: PaymentRecord = {
        id: `PAY-${timestamp}`,
        studentId: student.id,
        receiptNumber,
        amount: payAmount,
        date: today,
        paymentMode,
        bankName: selectedPortal.name,
        transactionRef,
        status: 'SUCCESS',
        remarks: `Online payment via ${selectedPortal.name}`,
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
        amountPaidNow: payAmount,
        balanceRemaining: newPendingDue,
        paymentMode,
        transactionRef,
        bankName: selectedPortal.name,
        authorizedBy: 'Automated Banking Gateway Clearing (SBI/HDFC Core Switch)',
        digitalSealVerified: true,
        status: 'PAID',
      };

      if (onPaymentSuccess) {
        onPaymentSuccess(updatedStudent, newReceipt);
      }
      setIsProcessing(false);
      setPaymentSuccessNotice(`Payment of ₹${payAmount.toLocaleString('en-IN')} via ${selectedPortal.name} completed successfully! Official receipt #${receiptNumber} generated.`);
      setTimeout(() => setPaymentSuccessNotice(null), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Student Welcome Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-4 rounded-xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="w-13 h-13 rounded-full border-2 border-blue-400/50 object-cover shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{student.name}</h2>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-[10px] font-mono font-bold">
                {student.rollNo}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {student.degreeProgram} • Semester {student.semester} ({student.academicYear})
            </p>
            <p className="text-[11px] text-slate-400">
              Department: {student.department} | Guardian: {student.parentName} ({student.parentPhone})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
          {onOpenInstallments && (
            <button
              onClick={onOpenInstallments}
              className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 rounded-lg text-xs font-bold border border-indigo-400/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-300" />
              <span>Flexi Installments</span>
            </button>
          )}

          {onOpenScholarships && (
            <button
              onClick={onOpenScholarships}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-xs font-bold border border-amber-400/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Apply Scholarship</span>
            </button>
          )}

          <button
            onClick={handleOpenQR}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-300" />
            <span>Digital Bursar QR Pass</span>
          </button>
        </div>
      </div>

      {/* Payment Success Alert */}
      {paymentSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{paymentSuccessNotice}</span>
        </div>
      )}

      {/* Due / Overdue Alert Banner */}
      {!isCleared && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
            isOverdue
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`} />
            <div>
              <span className="font-bold block">
                {isOverdue ? 'URGENT: Outstanding Semester Dues (Overdue Warning)' : 'Notice: Upcoming Fee Due Date'}
              </span>
              <p className="text-[11px] mt-0.5 leading-relaxed">
                {isOverdue
                  ? `Your semester fee balance of ₹${student.pendingDue.toLocaleString('en-IN')} was due on ${student.dueDate} and is overdue. Kindly settle dues to ensure examination eligibility and hall-ticket clearance.`
                  : `Your semester fee balance of ₹${student.pendingDue.toLocaleString('en-IN')} is scheduled for payment by ${student.dueDate}. Avoid late fines by settling online today.`}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-white rounded font-mono font-bold text-xs border border-slate-300 shrink-0">
            Due: {student.dueDate}
          </span>
        </div>
      )}

      {/* Core KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Assessed Fee</div>
          <div className="text-base font-mono font-bold text-slate-900 mt-1">
            ₹{student.totalFee.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{student.scholarshipQuota || 'Standard Category'}</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-emerald-700">Amount Paid</div>
          <div className="text-base font-mono font-bold text-emerald-700 mt-1">
            ₹{student.paidAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {((student.paidAmount / student.totalFee) * 100).toFixed(0)}% Discharged
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-rose-700">Outstanding Due</div>
          <div className="text-base font-mono font-bold text-rose-700 mt-1">
            ₹{student.pendingDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {student.pendingDue === 0 ? 'No Dues Pending' : `Payable by ${student.dueDate}`}
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-500">Clearance Status</div>
          <div className="mt-1">
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1 ${
                student.status === 'CLEARED'
                  ? 'bg-emerald-100 text-emerald-900'
                  : student.status === 'OVERDUE'
                  ? 'bg-rose-100 text-rose-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {student.status === 'CLEARED' && <CheckCircle2 className="w-3 h-3" />}
              {student.status}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">AY 2025-26 Hall Ticket</div>
        </div>
      </div>

      {/* Main Grid: Payment Gateway + Fee Structure Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Online Payment Desk */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-slate-900">Direct Online Banking & UPI Gateway</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Instant E-Receipt Generation</span>
            </div>

            {isCleared ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Your College Dues are Fully Settled!</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  There are no pending fees for the current semester. You can download your official payment receipts below or show your digital Bursar QR pass at the library and exam hall.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Amount to Pay */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Payment Amount (₹ INR)
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPayAmount(student.pendingDue)}
                      className={`p-2 rounded border text-left cursor-pointer transition ${
                        payAmount === student.pendingDue
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-[10px] text-slate-500">Full Outstanding</div>
                      <div className="font-mono text-sm">₹{student.pendingDue.toLocaleString('en-IN')}</div>
                    </button>

                    {student.pendingDue > 10000 && (
                      <button
                        type="button"
                        onClick={() => setPayAmount(Math.round(student.pendingDue / 2))}
                        className={`p-2 rounded border text-left cursor-pointer transition ${
                          payAmount === Math.round(student.pendingDue / 2)
                            ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="text-[10px] text-slate-500">50% Installment</div>
                        <div className="font-mono text-sm">₹{Math.round(student.pendingDue / 2).toLocaleString('en-IN')}</div>
                      </button>
                    )}

                    <div className="p-1 border border-slate-200 rounded flex flex-col justify-center bg-white">
                      <div className="text-[9px] text-slate-500 px-1">Custom Amount</div>
                      <div className="flex items-center">
                        <span className="text-xs font-mono text-slate-400 pl-1">₹</span>
                        <input
                          type="number"
                          value={payAmount}
                          onChange={(e) => setPayAmount(Math.min(student.pendingDue, Math.max(500, Number(e.target.value))))}
                          className="w-full text-xs font-mono font-bold px-1 py-0.5 border-none focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank / Gateway Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Integrated Banking / UPI Portal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {BANK_PORTALS.map((portal) => (
                      <div
                        key={portal.id}
                        onClick={() => setSelectedPortal(portal)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                          selectedPortal.id === portal.id
                            ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-[10px] ${portal.logoColor}`}>
                            {portal.code.slice(0, 3)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-tight">{portal.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {portal.type === 'UPI' ? 'Zero Surcharge • Instant QR' : 'NetBanking / Gateway'}
                            </div>
                          </div>
                        </div>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedPortal.id === portal.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}>
                          {selectedPortal.id === portal.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pay Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Encrypted via 256-bit SSL • Official Degree College Bursary Gateway
                  </div>
                  <button
                    onClick={handlePayNow}
                    disabled={isProcessing || payAmount <= 0}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Connecting to Bank Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ₹{payAmount.toLocaleString('en-IN')} Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student Payment History & Receipts */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ReceiptIcon className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-slate-900">Your Official Payment Receipts</h3>
              </div>
              <span className="text-[10px] text-slate-500">NAAC Verified Digital Receipts</span>
            </div>

            {student.paymentHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No past payment transactions recorded.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {student.paymentHistory.map((pmt) => (
                  <div
                    key={pmt.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{pmt.receiptNumber}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded text-[10px] font-bold">
                          {pmt.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {pmt.date} • {pmt.bankName} • Ref: {pmt.transactionRef}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        ₹{pmt.amount.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => {
                          const pseudoReceipt: Receipt = {
                            receiptNumber: pmt.receiptNumber,
                            date: pmt.date,
                            studentId: student.id,
                            rollNo: student.rollNo,
                            studentName: student.name,
                            degreeProgram: student.degreeProgram,
                            department: student.department,
                            semester: student.semester,
                            academicYear: student.academicYear,
                            items: student.feeItems,
                            subtotal: student.totalFee,
                            scholarshipDiscount: 0,
                            lateFee: 0,
                            totalAmount: student.totalFee,
                            amountPaidNow: pmt.amount,
                            balanceRemaining: student.pendingDue,
                            paymentMode: pmt.paymentMode,
                            transactionRef: pmt.transactionRef,
                            bankName: pmt.bankName,
                            authorizedBy: 'Rajesh K. Verma (Senior Bursar)',
                            digitalSealVerified: true,
                            status: 'RECONCILED',
                          };
                          onViewReceipt(pseudoReceipt);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-blue-700 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Download className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Fee Structure Breakdown & Bursar QR Badge */}
        <div className="space-y-4">
          {/* Quick Bursar Counter Pass Widget */}
          <div className="p-4 bg-gradient-to-b from-blue-900 to-indigo-950 text-white rounded-lg shadow-sm text-center">
            <div className="text-[10px] uppercase tracking-wider font-bold text-blue-200">
              Bursar Office Counter Pass
            </div>
            <div className="my-2 p-2 bg-white rounded-lg inline-block shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                  student.qrToken
                )}`}
                alt="Student QR"
                className="w-24 h-24"
              />
            </div>
            <div className="font-mono text-xs font-bold">{student.rollNo}</div>
            <p className="text-[10px] text-blue-200 mt-1 leading-tight">
              Scan this QR code at the Bursar Counter for instant dues verification and cashless POS payment
            </p>
            <button
              onClick={handleOpenQR}
              className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition cursor-pointer"
            >
              Open Fullscreen Pass
            </button>
          </div>

          {/* Detailed Fee Structure breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
              Semester Fee Schedule Breakdown
            </h4>
            <div className="mt-2.5 divide-y divide-slate-100 text-xs">
              {student.feeItems.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-800 block">{item.description}</span>
                    <span className="text-[10px] text-slate-400">{item.category}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              <div className="pt-2.5 flex items-center justify-between font-bold text-slate-900">
                <span>Total Assessed</span>
                <span className="font-mono">₹{student.totalFee.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Digital QR Pass Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Student Pass</span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  student.qrToken
                )}`}
                alt="Student QR Pass"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
              <p className="font-mono text-xs text-blue-800 font-bold mt-0.5">{student.rollNo}</p>
              <p className="text-xs text-slate-500 mt-1">{student.degreeProgram} • Sem {student.semester}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                Pending Due: ₹{student.pendingDue.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
