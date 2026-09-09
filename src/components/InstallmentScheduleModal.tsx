import React, { useState } from 'react';
import { Student, InstallmentPlan, InstallmentItem, PaymentMode } from '../types';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  IndianRupee, 
  X, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface InstallmentScheduleModalProps {
  student: Student;
  plan?: InstallmentPlan | null;
  onClose: () => void;
  onOptIntoPlan: (studentId: string, count: 2 | 3) => void;
  onPayInstallment: (student: Student, item: InstallmentItem) => void;
}

export const InstallmentScheduleModal: React.FC<InstallmentScheduleModalProps> = ({
  student,
  plan,
  onClose,
  onOptIntoPlan,
  onPayInstallment,
}) => {
  const [selectedPlanType, setSelectedPlanType] = useState<2 | 3>(plan?.installmentsCount === 3 ? 3 : 2);

  // If student does not have an active plan, generate prospective plan
  const generateProspectiveItems = (count: 2 | 3): InstallmentItem[] => {
    const total = student.totalFee;
    if (count === 2) {
      const half = Math.round(total / 2);
      return [
        {
          installmentNumber: 1,
          title: 'Installment 1 (Term Registration & Tuition 50%)',
          amount: half,
          dueDate: '2026-01-25',
          status: student.paidAmount >= half ? 'PAID' : 'DUE',
          paidDate: student.paidAmount >= half ? '2026-01-20' : undefined,
          lateFee: 0,
        },
        {
          installmentNumber: 2,
          title: 'Installment 2 (Mid-Term Balance & Examination Fee)',
          amount: total - half,
          dueDate: '2026-03-10',
          status: student.pendingDue === 0 ? 'PAID' : (new Date('2026-03-10') < new Date() ? 'OVERDUE' : 'DUE'),
          lateFee: student.pendingDue > 0 ? 500 : 0,
        },
      ];
    } else {
      const part1 = Math.round(total * 0.4);
      const part2 = Math.round(total * 0.3);
      const part3 = total - part1 - part2;
      return [
        {
          installmentNumber: 1,
          title: 'Installment 1 (Term Registration & Core Lab 40%)',
          amount: part1,
          dueDate: '2026-01-30',
          status: student.paidAmount >= part1 ? 'PAID' : 'DUE',
          paidDate: student.paidAmount >= part1 ? '2026-01-28' : undefined,
          lateFee: 0,
        },
        {
          installmentNumber: 2,
          title: 'Installment 2 (Mid-Semester Tuition 30%)',
          amount: part2,
          dueDate: '2026-03-15',
          status: student.paidAmount >= (part1 + part2) ? 'PAID' : 'DUE',
          lateFee: 0,
        },
        {
          installmentNumber: 3,
          title: 'Installment 3 (Final Semester Exam & Library 30%)',
          amount: part3,
          dueDate: '2026-04-20',
          status: student.pendingDue === 0 ? 'PAID' : 'DUE',
          lateFee: 0,
        },
      ];
    }
  };

  const activeItems = plan ? plan.items : generateProspectiveItems(selectedPlanType);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Flexi-Payment & Installment Schedule</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-400/20 text-blue-200 border border-blue-400/30">
                  {student.academicYear}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {student.name} • {student.rollNo} • Total Assessment: ₹{student.totalFee.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white p-1 rounded-lg hover:bg-blue-800/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Switcher */}
        {!plan && (
          <div className="bg-blue-50 border-b border-blue-100 p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Select Flexible Installment Structure:
              </div>
              <div className="text-[11px] text-blue-700">Split your semester dues into convenient scheduled dates.</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPlanType(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                  selectedPlanType === 2
                    ? 'bg-blue-700 text-white border-blue-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                2-Term Plan (50% / 50%)
              </button>
              <button
                onClick={() => setSelectedPlanType(3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                  selectedPlanType === 3
                    ? 'bg-blue-700 text-white border-blue-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                3-Term Plan (40% / 30% / 30%)
              </button>
            </div>
          </div>
        )}

        {/* Installment Items Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {plan ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Active Plan Enrolled: <strong>{plan.installmentsCount} Installments</strong> (Opted: {plan.optedDate})</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded font-bold text-emerald-900">
                Plan ID #{plan.id}
              </span>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Previewing Prospective Schedule. Click "Enroll in Plan" below to activate.</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {activeItems.map((item) => {
              const isPaid = item.status === 'PAID';
              const isOverdue = item.status === 'OVERDUE';
              return (
                <div
                  key={item.installmentNumber}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPaid
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isOverdue
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        isPaid ? 'bg-emerald-600 text-white' : isOverdue ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {item.installmentNumber}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        isPaid 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pl-8">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Due Date: <strong className="text-slate-700">{item.dueDate}</strong>
                      </span>
                      {isPaid && item.paidDate && (
                        <span className="text-emerald-700 font-medium">
                          Paid on {item.paidDate} {item.transactionRef && `(${item.transactionRef})`}
                        </span>
                      )}
                      {isOverdue && item.lateFee > 0 && (
                        <span className="text-rose-700 font-medium">
                          + ₹{item.lateFee} Late Fine Applied
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end pl-8 sm:pl-0">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => {
                          onClose();
                          onPayInstallment(student, item);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Installment</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Pending Balance: <strong className="text-slate-900 font-mono">₹{student.pendingDue.toLocaleString('en-IN')}</strong>
          </div>

          <div className="flex items-center gap-2">
            {!plan && (
              <button
                onClick={() => onOptIntoPlan(student.id, selectedPlanType)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Enroll in {selectedPlanType}-Term Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
