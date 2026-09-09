import React, { useState, useMemo } from 'react';
import { Student, PaymentStatus, Receipt, UserRole } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Search, 
  Filter, 
  QrCode, 
  CreditCard, 
  Banknote, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpDown,
  Download,
  Eye,
  User,
  ShieldCheck,
  Building,
  GraduationCap,
  Lock,
  Edit2
} from 'lucide-react';

interface StudentTrackingProps {
  students: Student[];
  currentUserRole?: UserRole;
  onOpenBankingPortal: (student: Student) => void;
  onOpenBursarCounter: (student: Student) => void;
  onViewReceipt: (receipt: Receipt) => void;
  onSelectStudentDetail: (student: Student) => void;
  onUpdateStudent?: (student: Student) => void;
}

export const StudentTracking: React.FC<StudentTrackingProps> = ({
  students,
  currentUserRole = 'SUPER_ADMIN',
  onOpenBankingPortal,
  onOpenBursarCounter,
  onViewReceipt,
  onSelectStudentDetail,
  onUpdateStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [qrModalStudent, setQrModalStudent] = useState<Student | null>(null);

  const canEdit = currentUserRole === 'SUPER_ADMIN';

  // Extract unique departments and semesters
  const departments = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.department)));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.degreeProgram.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.parentName && student.parentName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' || student.status === statusFilter;

      const matchesDept =
        departmentFilter === 'ALL' || student.department === departmentFilter;

      const matchesSem =
        semesterFilter === 'ALL' || student.semester.toString() === semesterFilter;

      return matchesSearch && matchesStatus && matchesDept && matchesSem;
    });
  }, [students, searchQuery, statusFilter, departmentFilter, semesterFilter]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Control Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span>Student Fee Ledgers & Payment Registry</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Manage student fee assessments, unique collegiate QR badges, and transaction records.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
              canEdit 
                ? 'bg-purple-50 text-purple-900 border-purple-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {canEdit ? 'Super Admin: Write Authorized' : 'Read-Only Ledger (Super Admin Protected)'}
            </span>

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
              {filteredStudents.length} of {students.length} Students
            </span>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-0.5">
          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Student, Parent, Roll No..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="CLEARED">Cleared / Fully Paid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="OVERDUE">Overdue (Defaulters)</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Semesters</option>
              <option value="2">Semester 2</option>
              <option value="4">Semester 4</option>
              <option value="6">Semester 6</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="py-2.5 px-4">Student & Program</th>
                <th className="py-2.5 px-3 text-center">QR Badge</th>
                <th className="py-2.5 px-4 text-right">Total Fee</th>
                <th className="py-2.5 px-4 text-right">Paid Amount</th>
                <th className="py-2.5 px-4 text-right">Pending Due</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const statusBadges: Record<PaymentStatus, { bg: string; label: string }> = {
                    CLEARED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: '● Cleared' },
                    PARTIAL: { bg: 'bg-amber-50 text-amber-700 border-amber-100', label: '◐ Partial' },
                    OVERDUE: { bg: 'bg-rose-50 text-rose-700 border-rose-100', label: '▲ Overdue' },
                    UNPAID: { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: '○ Unpaid' },
                  };

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition">
                      {/* Student Profile Info */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {student.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              <span className="font-mono text-slate-700 font-bold">{student.rollNo}</span> • {student.department}
                            </div>
                            <div className="text-[9px] text-slate-400">
                              Parent: {student.parentName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* QR Badge Trigger */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setQrModalStudent(student)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-lg border border-slate-200 transition cursor-pointer inline-flex items-center gap-1"
                          title="View Digital QR Pass"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono font-semibold">QR</span>
                        </button>
                      </td>

                      {/* Total Fee */}
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                        ₹{student.totalFee.toLocaleString('en-IN')}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800">
                        ₹{student.paidAmount.toLocaleString('en-IN')}
                      </td>

                      {/* Pending Due */}
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700">
                        ₹{student.pendingDue.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            statusBadges[student.status]?.bg || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {statusBadges[student.status]?.label || student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {student.pendingDue > 0 ? (
                            <>
                              <button
                                onClick={() => onOpenBankingPortal(student)}
                                className="px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Pay via Online Banking Portal"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Bank Pay</span>
                              </button>
                              <button
                                onClick={() => onOpenBursarCounter(student)}
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Record Bursar Counter Payment"
                              >
                                <Banknote className="w-3 h-3" />
                                <span>Counter</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                const lastRec = student.paymentHistory[student.paymentHistory.length - 1];
                                if (lastRec) {
                                  onViewReceipt({
                                    receiptNumber: lastRec.receiptNumber,
                                    date: lastRec.date,
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
                                    amountPaidNow: lastRec.amount,
                                    balanceRemaining: 0,
                                    paymentMode: lastRec.paymentMode,
                                    transactionRef: lastRec.transactionRef,
                                    bankName: lastRec.bankName,
                                    authorizedBy: 'Collegiate Bursar Registry',
                                    digitalSealVerified: true,
                                    status: 'PAID',
                                  });
                                }
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                            >
                              <FileText className="w-3 h-3 text-slate-600" />
                              <span>Receipt</span>
                            </button>
                          )}

                          <button
                            onClick={() => onSelectStudentDetail(student)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer"
                            title={canEdit ? 'View & Edit Ledger' : 'View Ledger'}
                          >
                            {canEdit ? <Edit2 className="w-3.5 h-3.5 text-purple-700" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unique Student QR Code Modal */}
      {qrModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                  Collegiate Digital ID Pass
                </span>
                <h4 className="text-sm font-bold text-slate-900">{qrModalStudent.name}</h4>
              </div>
              <button
                onClick={() => setQrModalStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200">
                <QRCodeSVG value={qrModalStudent.qrToken} size={160} level="H" />
              </div>
              <p className="font-mono text-xs font-bold text-slate-800 mt-2">
                {qrModalStudent.rollNo}
              </p>
              <p className="text-[11px] text-slate-500">
                {qrModalStudent.degreeProgram} • Sem {qrModalStudent.semester}
              </p>
              <div className="mt-2 text-xs font-bold px-3 py-0.5 rounded-full bg-blue-100 text-blue-900">
                Pending Due: ₹{qrModalStudent.pendingDue.toLocaleString('en-IN')}
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Students present this encrypted QR at the Bursar Counter or scan with mobile devices to verify credentials and dues instantly.
            </p>

            <button
              onClick={() => {
                setQrModalStudent(null);
                onOpenBursarCounter(qrModalStudent);
              }}
              className="w-full py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Simulate Scan at Bursar Counter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
