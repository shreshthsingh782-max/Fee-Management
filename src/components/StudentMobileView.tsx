import React, { useState } from 'react';
import { Student, Receipt } from '../types';
import { COLLEGE_INFO } from '../data/mockData';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Smartphone, 
  CreditCard, 
  QrCode, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  ChevronRight,
  User,
  Building2,
  Calendar,
  Share2
} from 'lucide-react';

interface StudentMobileViewProps {
  students: Student[];
  onOpenBankingPortal: (student: Student) => void;
  onViewReceipt: (receipt: Receipt) => void;
}

export const StudentMobileView: React.FC<StudentMobileViewProps> = ({
  students,
  onOpenBankingPortal,
  onViewReceipt,
}) => {
  // Let user toggle which student's phone they are simulating
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.find((s) => s.pendingDue > 0)?.id || students[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'ID_CARD' | 'FEES' | 'RECEIPTS'>('ID_CARD');

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0] || null;

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Student Records Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          There are currently no student records enrolled in the system. Use the dashboard or setup wizard to enroll students to preview the mobile ID companion.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls: Switch Simulated Mobile Profile */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Mobile App Simulation
            </span>
            <span className="text-[11px] text-slate-500">Student Self-Service Portal</span>
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-0.5">
            Collegiate Mobile Companion & Digital ID Pass
          </h2>
          <p className="text-[11px] text-slate-500">
            Students scan this screen at the Bursar counter or pay through connected banking gateways.
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-slate-600 shrink-0">Switch Student:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {students.map((stu) => (
              <option key={stu.id} value={stu.id}>
                {stu.name} ({stu.rollNo} - {stu.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Centered Phone Shell Mockup */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm bg-slate-900 p-3 rounded-[36px] shadow-xl border-2 border-slate-800">
          {/* Top speaker & camera notch */}
          <div className="relative bg-white rounded-[28px] overflow-hidden flex flex-col min-h-[580px] shadow-inner">
            {/* Phone Status Bar */}
            <div className="px-5 pt-2.5 pb-1 flex justify-between items-center text-[10px] font-semibold text-slate-600 bg-slate-100 border-b border-slate-200">
              <span>9:41 AM</span>
              <div className="w-16 h-3.5 bg-slate-900 rounded-full mx-auto"></div>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Mobile App Header */}
            <div className="bg-slate-900 text-white p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-300 flex items-center justify-center border border-blue-400/30">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight truncate">Apex Degree College</h3>
                    <p className="text-[10px] text-slate-400">Student Mobile Portal</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700">
                  Sem {currentStudent.semester}
                </span>
              </div>
            </div>

            {/* App Nav Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
              <button
                onClick={() => setActiveTab('ID_CARD')}
                className={`flex-1 py-2 font-semibold text-center transition cursor-pointer border-b-2 ${
                  activeTab === 'ID_CARD'
                    ? 'border-blue-700 text-blue-800 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Digital Pass
              </button>
              <button
                onClick={() => setActiveTab('FEES')}
                className={`flex-1 py-2 font-semibold text-center transition cursor-pointer border-b-2 ${
                  activeTab === 'FEES'
                    ? 'border-blue-700 text-blue-800 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Fee Dues
              </button>
              <button
                onClick={() => setActiveTab('RECEIPTS')}
                className={`flex-1 py-2 font-semibold text-center transition cursor-pointer border-b-2 ${
                  activeTab === 'RECEIPTS'
                    ? 'border-blue-700 text-blue-800 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Receipts ({currentStudent.paymentHistory.length})
              </button>
            </div>

            {/* Tab 1: Digital ID Pass with Unique Student QR Code */}
            {activeTab === 'ID_CARD' && (
              <div className="p-3.5 space-y-3 overflow-y-auto flex-1">
                {/* ID Card Graphic */}
                <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-sm border border-slate-800 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-bold text-amber-300">
                        OFFICIAL STUDENT DIGITAL ID
                      </span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{currentStudent.name}</h4>
                      <p className="text-[10px] text-slate-300">{currentStudent.degreeProgram}</p>
                    </div>
                    <img
                      src={currentStudent.avatarUrl}
                      alt={currentStudent.name}
                      className="w-10 h-10 rounded-lg object-cover border border-amber-300/60 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* QR Box in Center */}
                  <div className="bg-white p-2.5 rounded-lg shadow-xs flex flex-col items-center justify-center my-2">
                    <QRCodeSVG value={currentStudent.qrToken} size={120} level="H" />
                    <span className="text-[9px] font-mono font-bold text-slate-800 mt-1">
                      {currentStudent.rollNo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Valid: 2025-2026 Academic Yr</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </div>

                {/* Instant Scan Instructions */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-0.5">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5 text-[11px]">
                    <QrCode className="w-3.5 h-3.5 text-blue-700" />
                    <span>Bursar Counter Rapid Scan</span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Present this QR code to the cashier at the college bursar office for instant dues lookup and fee payment.
                  </p>
                </div>

                {/* Direct Pay Action if dues present */}
                {currentStudent.pendingDue > 0 ? (
                  <button
                    onClick={() => onOpenBankingPortal(currentStudent)}
                    className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay ₹{currentStudent.pendingDue.toLocaleString('en-IN')} via Banking Portal</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Semester Fee Cleared (No Dues)</span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Fee Dues Breakdown */}
            {activeTab === 'FEES' && (
              <div className="p-3.5 space-y-3 overflow-y-auto flex-1 text-xs">
                {/* Dues Summary Pill */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Pending Balance</span>
                    <span className="text-base font-mono font-bold text-slate-900">
                      ₹{currentStudent.pendingDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      currentStudent.pendingDue === 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {currentStudent.status}
                  </span>
                </div>

                {/* Itemized list */}
                <div>
                  <h4 className="font-bold text-slate-700 mb-1.5 text-[11px]">Itemized Assessment</h4>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden bg-white">
                    {currentStudent.feeItems.map((item) => (
                      <div key={item.id} className="p-2 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="font-semibold text-slate-800 block">{item.category}</span>
                          <span className="text-slate-500 text-[9px]">{item.description}</span>
                        </div>
                        <span className="font-mono font-semibold text-slate-900 text-xs">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentStudent.pendingDue > 0 && (
                  <button
                    onClick={() => onOpenBankingPortal(currentStudent)}
                    className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Dues Online Now</span>
                  </button>
                )}
              </div>
            )}

            {/* Tab 3: Receipts History */}
            {activeTab === 'RECEIPTS' && (
              <div className="p-3.5 space-y-2.5 overflow-y-auto flex-1 text-xs">
                <h4 className="font-bold text-slate-700 text-[11px]">Issued Electronic Receipts</h4>
                {currentStudent.paymentHistory.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <FileText className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p className="text-[11px]">No payment receipts issued yet.</p>
                  </div>
                ) : (
                  currentStudent.paymentHistory.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => {
                        onViewReceipt({
                          receiptNumber: rec.receiptNumber,
                          date: rec.date,
                          studentId: currentStudent.id,
                          rollNo: currentStudent.rollNo,
                          studentName: currentStudent.name,
                          degreeProgram: currentStudent.degreeProgram,
                          department: currentStudent.department,
                          semester: currentStudent.semester,
                          academicYear: currentStudent.academicYear,
                          items: currentStudent.feeItems,
                          subtotal: currentStudent.totalFee,
                          scholarshipDiscount: 0,
                          lateFee: 0,
                          totalAmount: currentStudent.totalFee,
                          amountPaidNow: rec.amount,
                          balanceRemaining: currentStudent.pendingDue,
                          paymentMode: rec.paymentMode,
                          transactionRef: rec.transactionRef,
                          bankName: rec.bankName,
                          authorizedBy: 'Collegiate Banking Gateway Settlement',
                          digitalSealVerified: true,
                          status: 'PAID',
                        });
                      }}
                      className="p-2.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg flex items-center justify-between cursor-pointer transition shadow-2xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          {rec.receiptNumber}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {rec.date} • {rec.paymentMode.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-800 block text-xs">
                          ₹{rec.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-blue-600 hover:underline flex items-center gap-0.5 justify-end font-semibold">
                          View Voucher <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
