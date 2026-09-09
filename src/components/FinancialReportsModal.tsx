import React, { useState } from 'react';
import { Student, Receipt, StaffExpense, UserRole } from '../types';
import { COLLEGE_INFO } from '../data/mockData';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  X, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Building2, 
  CheckCircle2,
  Table,
  Filter
} from 'lucide-react';

interface FinancialReportsModalProps {
  students: Student[];
  receipts: Receipt[];
  expenses: StaffExpense[];
  currentUserRole: UserRole;
  onClose: () => void;
}

export const FinancialReportsModal: React.FC<FinancialReportsModalProps> = ({
  students,
  receipts,
  expenses,
  currentUserRole,
  onClose,
}) => {
  const [selectedReport, setSelectedReport] = useState<'GST_EXEMPTION' | 'COLLECTION_BREAKDOWN' | 'EXPORT_HUB'>('EXPORT_HUB');

  // Overall totals
  const totalAssessed = students.reduce((acc, s) => acc + s.totalFee, 0);
  const totalCollected = students.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalPending = students.reduce((acc, s) => acc + s.pendingDue, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const recoveryRate = totalAssessed > 0 ? ((totalCollected / totalAssessed) * 100).toFixed(1) : '0';

  // Export CSV functions
  const exportStudentsCSV = () => {
    const headers = ['Roll No', 'Name', 'Department', 'Program', 'Semester', 'Total Fee (INR)', 'Paid (INR)', 'Pending Due (INR)', 'Status', 'Due Date', 'Phone', 'Parent Phone'];
    const rows = students.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.degreeProgram}"`,
      s.semester,
      s.totalFee,
      s.paidAmount,
      s.pendingDue,
      `"${s.status}"`,
      `"${s.dueDate}"`,
      `"${s.phone}"`,
      `"${s.parentPhone}"`,
    ]);
    downloadCSV(headers, rows, `Student_Ledgers_Master_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportReceiptsCSV = () => {
    const headers = ['Receipt No', 'Date', 'Roll No', 'Student Name', 'Department', 'Amount Paid (INR)', 'Payment Mode', 'Transaction Ref', 'Bank Name', 'Status'];
    const rows = receipts.map((r) => [
      `"${r.receiptNumber}"`,
      `"${r.date}"`,
      `"${r.rollNo}"`,
      `"${r.studentName}"`,
      `"${r.department}"`,
      r.amountPaidNow,
      `"${r.paymentMode}"`,
      `"${r.transactionRef}"`,
      `"${r.bankName}"`,
      `"${r.status}"`,
    ]);
    downloadCSV(headers, rows, `Receipts_Transactions_Audit_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportExpensesCSV = () => {
    const headers = ['Voucher No', 'Date', 'Staff Name', 'Department', 'Category', 'Purpose', 'Amount (INR)', 'Payment Mode', 'Status', 'Vendor Name', 'Vendor GSTIN', 'Invoice No'];
    const rows = expenses.map((e) => [
      `"${e.voucherNo}"`,
      `"${e.date}"`,
      `"${e.staffName}"`,
      `"${e.department}"`,
      `"${e.category}"`,
      `"${e.purpose.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.paymentMode}"`,
      `"${e.status}"`,
      `"${e.vendorName || 'N/A'}"`,
      `"${e.vendorGstin || 'N/A'}"`,
      `"${e.invoiceNo || 'N/A'}"`,
    ]);
    downloadCSV(headers, rows, `Institutional_Expenditures_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadCSV = (headers: string[], rows: any[][], fileName: string) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 print:border-none print:shadow-none print:max-h-none print:max-w-none">
        {/* Header - Screen only */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Financial Reports, GST Invoices & Exports</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  SAC 9992 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Statutory audit statements, educational GST exemption disclosures, and tabular ledger downloads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs - Screen only */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedReport('EXPORT_HUB')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                selectedReport === 'EXPORT_HUB'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Data Export Center (CSV / Excel)</span>
            </button>

            <button
              onClick={() => setSelectedReport('GST_EXEMPTION')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                selectedReport === 'GST_EXEMPTION'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Statutory GST Exemption Statement (SAC 9992)</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer mb-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DATA EXPORT HUB */}
          {selectedReport === 'EXPORT_HUB' && (
            <div className="space-y-6">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="text-slate-500 font-medium">Assessed Student Fees</div>
                  <div className="font-mono text-base font-bold text-slate-900">₹{totalAssessed.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-slate-400">{students.length} Active Records</div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="text-emerald-700 font-medium">Recovered Inward</div>
                  <div className="font-mono text-base font-bold text-emerald-900">₹{totalCollected.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">{recoveryRate}% Recovery Rate</div>
                </div>

                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="text-rose-700 font-medium">Outstanding Dues</div>
                  <div className="font-mono text-base font-bold text-rose-900">₹{totalPending.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-rose-600 font-semibold">
                    {students.filter((s) => s.status === 'OVERDUE' || s.status === 'PARTIAL').length} Pending Students
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                  <div className="text-blue-700 font-medium">Staff Expenditures</div>
                  <div className="font-mono text-base font-bold text-blue-900">₹{totalExpenses.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-blue-600">{expenses.length} Vouchers Audited</div>
                </div>
              </div>

              {/* Export Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Export Tabular Financial Ledgers
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs transition space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Table className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Student Fee Master (.csv)</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Complete roll numbers, assessed fee structures, paid amounts, outstanding balances, and contact details.
                      </p>
                    </div>

                    <button
                      onClick={exportStudentsCSV}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Master Ledger</span>
                    </button>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 shadow-xs transition space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Official Receipts Audit (.csv)</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Every issued receipt with date, bank ref, POS terminal info, payment channel (UPI, Cash, Cards), and verification tags.
                      </p>
                    </div>

                    <button
                      onClick={exportReceiptsCSV}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Receipts Register</span>
                    </button>
                  </div>

                  {/* Card 3 */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-400 shadow-xs transition space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Expenditure Vouchers (.csv)</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Departmental expense disbursements, vendor GST numbers, tax invoice numbers, and institutional budget heads.
                      </p>
                    </div>

                    <button
                      onClick={exportExpensesCSV}
                      className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Expense Log</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GST STATUTORY EXEMPTION STATEMENT */}
          {selectedReport === 'GST_EXEMPTION' && (
            <div className="max-w-2xl mx-auto p-6 bg-white border border-slate-300 rounded-xl shadow-xs space-y-5 text-slate-900 print:border-none print:p-0">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h3 className="font-serif font-black text-lg text-slate-900 uppercase tracking-tight">
                    {COLLEGE_INFO.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-sans">{COLLEGE_INFO.address}</p>
                  <p className="text-[11px] font-mono text-slate-500">Institution Code: {COLLEGE_INFO.code}</p>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    STATUTORY TAX FILING
                  </span>
                  <div className="font-bold text-sm mt-1">FORM GSTR-EDU-9992</div>
                  <div className="text-slate-500">Academic Year: {COLLEGE_INFO.academicYear}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-800">
                  Statutory Exemption Certificate under GST Law (Notification No. 12/2017 - Central Tax (Rate))
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Services provided by an educational institution to its students, faculty and staff under 
                  <strong> Services Accounting Code (SAC) 9992 (Education Services)</strong> are exempted from Central Tax (CGST), 
                  State Tax (SGST), and Integrated Tax (IGST) with <strong>NIL Rate of Tax (0%)</strong>.
                </p>
              </div>

              {/* Fee Component Breakdown Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gross Fee Assessment & Recovery Breakdown (Even Semester 2026)
                </h4>
                <table className="w-full text-xs border border-slate-300">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                    <tr>
                      <th className="p-2 text-left">Fee Head / Service Component</th>
                      <th className="p-2 text-center">SAC Code</th>
                      <th className="p-2 text-center">GST Rate</th>
                      <th className="p-2 text-right">Gross Assessed (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr>
                      <td className="p-2 font-sans font-medium">Core Academic Tuition & Instruction</td>
                      <td className="p-2 text-center font-bold text-blue-700">9992</td>
                      <td className="p-2 text-center text-emerald-700 font-bold">0% (Exempt)</td>
                      <td className="p-2 text-right">₹{Math.round(totalAssessed * 0.55).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans font-medium">Advanced Laboratory & Workshop Facilities</td>
                      <td className="p-2 text-center font-bold text-blue-700">9992</td>
                      <td className="p-2 text-center text-emerald-700 font-bold">0% (Exempt)</td>
                      <td className="p-2 text-right">₹{Math.round(totalAssessed * 0.20).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans font-medium">University Examination & Assessment Administration</td>
                      <td className="p-2 text-center font-bold text-blue-700">9992</td>
                      <td className="p-2 text-center text-emerald-700 font-bold">0% (Exempt)</td>
                      <td className="p-2 text-right">₹{Math.round(totalAssessed * 0.15).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans font-medium">Digital Library & IEEE Resource Subscriptions</td>
                      <td className="p-2 text-center font-bold text-blue-700">9992</td>
                      <td className="p-2 text-center text-emerald-700 font-bold">0% (Exempt)</td>
                      <td className="p-2 text-right">₹{Math.round(totalAssessed * 0.10).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="p-2 text-right font-sans">
                        Total Educational Turnover (Exempted):
                      </td>
                      <td className="p-2 text-right text-sm">₹{totalAssessed.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Certification Statement */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Bursary Certification
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Certified that the above gross billing has been assessed strictly for curricular education, accredited examinations, and laboratory training. No commercial taxable services were bundled or supplied.
                </p>
              </div>

              {/* Authentication Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-900">Dr. Vikramaditya Sharma</div>
                  <div className="text-slate-500 text-[10px]">Director of Finance & Bursary (Super Admin)</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-900">Dr. Meenakshi Sundaram</div>
                  <div className="text-slate-500 text-[10px]">Principal & Chief Academic Officer</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Collegiate ISO 9001 / NAAC Criterion 6 Resource Mobilization Audit Record</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
