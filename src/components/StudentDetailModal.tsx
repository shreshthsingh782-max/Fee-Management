import React, { useState } from 'react';
import { Student, Receipt, UserRole } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  User, 
  GraduationCap, 
  CreditCard, 
  Banknote, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Calendar, 
  Phone, 
  Mail, 
  QrCode,
  Lock,
  Edit2,
  Save,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  currentUserRole?: UserRole;
  onClose: () => void;
  onOpenBankingPortal: (student: Student) => void;
  onOpenBursarCounter: (student: Student) => void;
  onViewReceipt: (receipt: Receipt) => void;
  onUpdateStudentAssessment?: (updatedStudent: Student) => void;
  onOpenInstallments?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  currentUserRole = 'SUPER_ADMIN',
  onClose,
  onOpenBankingPortal,
  onOpenBursarCounter,
  onViewReceipt,
  onUpdateStudentAssessment,
  onOpenInstallments,
}) => {
  if (!student) return null;

  const canEdit = currentUserRole === 'SUPER_ADMIN';

  const [isEditingAssessment, setIsEditingAssessment] = useState(false);
  const [editTotalFee, setEditTotalFee] = useState(student.totalFee);
  const [editDueDate, setEditDueDate] = useState(student.dueDate);
  const [editScholarship, setEditScholarship] = useState(student.scholarshipQuota || '');

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !onUpdateStudentAssessment) return;

    const newPending = Math.max(0, editTotalFee - student.paidAmount);
    let newStatus = student.status;
    if (newPending === 0) newStatus = 'CLEARED';
    else if (student.paidAmount > 0) newStatus = 'PARTIAL';
    else newStatus = new Date(editDueDate) < new Date() ? 'OVERDUE' : 'UNPAID';

    const updated: Student = {
      ...student,
      totalFee: editTotalFee,
      pendingDue: newPending,
      dueDate: editDueDate,
      scholarshipQuota: editScholarship,
      status: newStatus,
    };

    onUpdateStudentAssessment(updated);
    setIsEditingAssessment(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-3 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-9 h-9 rounded-lg object-cover border border-slate-700 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white">{student.name}</h3>
                <span className="font-mono text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded">
                  {student.rollNo}
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                {student.degreeProgram} • Sem {student.semester} ({student.academicYear})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && !isEditingAssessment && (
              <button
                onClick={() => setIsEditingAssessment(true)}
                className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Assessment</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RBAC notice if not super admin */}
        {!canEdit && (
          <div className="px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              <strong>Master Data Restricted:</strong> Logged in as <strong>{currentUserRole.replace('_', ' ')}</strong>. In accordance with system security rules, only <strong>Super Admin</strong> can alter student fee assessments or edit master ledgers.
            </span>
          </div>
        )}

        {/* Super Admin Assessment Edit Form Drawer */}
        {isEditingAssessment && canEdit && (
          <form onSubmit={handleSaveAssessment} className="p-3.5 bg-purple-50/70 border-b border-purple-200 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-purple-200 text-xs font-bold text-purple-950">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                Super Admin: Modify Student Fee Assessment
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAssessment(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Total Assessed Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={editTotalFee}
                  onChange={(e) => setEditTotalFee(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Scholarship Quota</label>
                <input
                  type="text"
                  value={editScholarship}
                  onChange={(e) => setEditScholarship(e.target.value)}
                  placeholder="e.g. Merit Scholarship (15% Waiver)"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingAssessment(false)}
                className="px-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Assessment</span>
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Top Info & QR Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Academic & Contact Details (2 cols) */}
            <div className="md:col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Student & Guardian Contact Ledger
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">Department:</span>
                  <span className="font-semibold text-slate-800 text-xs">{student.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Current Semester:</span>
                  <span className="font-semibold text-slate-800 text-xs">Sem {student.semester} ({student.academicYear})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Student Email & Phone:</span>
                  <span className="font-mono text-slate-700 text-[11px] block truncate">{student.email}</span>
                  <span className="font-mono text-slate-700 text-[11px]">{student.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Parent / Guardian Intimation:</span>
                  <span className="font-semibold text-slate-800 text-xs block">{student.parentName}</span>
                  <span className="font-mono text-slate-600 text-[10px] block">{student.parentPhone}</span>
                  <span className="font-mono text-slate-600 text-[10px] truncate block">{student.parentEmail}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Category / Scholarship:</span>
                  <span className="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded text-[11px] inline-block border border-blue-200">
                    {student.scholarshipQuota || 'General Category'}
                  </span>
                </div>
              </div>
            </div>

            {/* Unique QR Code Card (1 col) */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 mb-1">
                Unique Student QR
              </span>
              <div className="p-1.5 bg-white rounded-lg shadow-xs border border-slate-200">
                <QRCodeSVG value={student.qrToken} size={88} level="M" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1">
                Counter Fast Scan
              </span>
            </div>
          </div>

          {/* Fee Status Summary Cards */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Fee</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-slate-800">
                ₹{student.totalFee.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-center shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Paid Amount</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-emerald-700">
                ₹{student.paidAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-2.5 bg-rose-50/50 border border-rose-200 rounded-lg text-center shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Pending Due</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-rose-700">
                ₹{student.pendingDue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Due Date</span>
              <span className="text-[11px] font-mono font-bold text-slate-800 block mt-0.5">
                {student.dueDate}
              </span>
              <span className={`text-[9px] font-bold ${student.status === 'OVERDUE' ? 'text-rose-600' : 'text-slate-500'}`}>
                {student.status}
              </span>
            </div>
          </div>

          {/* Fee Items Breakdown Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="p-2 bg-slate-100 font-bold text-slate-700 text-[10px] uppercase tracking-wider border-b border-slate-200">
              Assessed Fee Component Schedule
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200">
                  <th className="py-1.5 px-3">Description</th>
                  <th className="py-1.5 px-3">Category</th>
                  <th className="py-1.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {student.feeItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-1.5 px-3 font-medium text-slate-800">{item.description}</td>
                    <td className="py-1.5 px-3 text-slate-500">{item.category}</td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-800">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment History Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="p-2 bg-slate-100 font-bold text-slate-700 text-[10px] uppercase tracking-wider border-b border-slate-200">
              Verified Payment History
            </div>
            {student.paymentHistory.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                No payments recorded for this student yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {student.paymentHistory.map((rec) => (
                  <div key={rec.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-900">{rec.receiptNumber}</span>
                        <span className="text-[10px] font-mono text-slate-400">{rec.date}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                          {rec.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {rec.paymentMode.replace(/_/g, ' ')} • {rec.bankName} • Ref: {rec.transactionRef}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800 text-xs">
                        ₹{rec.amount.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => {
                          onViewReceipt({
                            receiptNumber: rec.receiptNumber,
                            date: rec.date,
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
                            amountPaidNow: rec.amount,
                            balanceRemaining: student.pendingDue,
                            paymentMode: rec.paymentMode,
                            transactionRef: rec.transactionRef,
                            bankName: rec.bankName,
                            authorizedBy: 'Collegiate Bursar Registry',
                            digitalSealVerified: true,
                            status: 'PAID',
                          });
                        }}
                        className="px-2 py-0.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded font-semibold cursor-pointer text-xs flex items-center gap-1 border border-blue-200"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-1.5">
            {onOpenInstallments && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInstallments(student);
                }}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded text-xs font-semibold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                title="Manage or Enroll Flexi-Installments"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Installments</span>
              </button>
            )}

            {student.pendingDue > 0 && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenBursarCounter(student);
                  }}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold transition shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Counter Payment</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenBankingPortal(student);
                  }}
                  className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold transition shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Banking Portal</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
