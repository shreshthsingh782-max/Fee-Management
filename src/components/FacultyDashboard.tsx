import React, { useState } from 'react';
import { Student, Receipt, StaffExpense, UserRole } from '../types';
import { FACULTY_TREND_DATA, DEPARTMENT_SUMMARIES, COLLEGE_INFO } from '../data/mockData';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Building,
  BellRing,
  IndianRupee, 
  ArrowUpRight, 
  Search,
  Users,
  AlertCircle,
  CreditCard,
  CheckCircle2
} from 'lucide-react';

interface FacultyDashboardProps {
  students: Student[];
  receipts: Receipt[];
  expenses: StaffExpense[];
  currentUserRole?: UserRole;
  currentUserName?: string;
  onSelectStudent: (student: Student) => void;
  onOpenDefaultersNotice: (overdueStudents: Student[]) => void;
  onSelectView?: (view: any) => void;
  onOpenBursarCounter?: (student: Student) => void;
  onViewReceipt?: (receipt: Receipt) => void;
  onOpenExpenditures?: () => void;
  onOpenReminders?: () => void;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#64748b'];

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  students,
  receipts,
  expenses,
  currentUserRole = 'SUPER_ADMIN',
  currentUserName,
  onSelectStudent,
  onOpenDefaultersNotice,
  onSelectView,
  onOpenBursarCounter,
  onViewReceipt,
  onOpenExpenditures,
  onOpenReminders,
}) => {
  const [quickSearch, setQuickSearch] = useState('');

  // Dynamic calculations from state
  const totalAssessed = students.reduce((acc, s) => acc + s.totalFee, 0);
  const totalCollected = students.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalPending = students.reduce((acc, s) => acc + s.pendingDue, 0);
  const totalExpenditure = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netSurplus = totalCollected - totalExpenditure;

  const collectionRate = totalAssessed > 0 ? ((totalCollected / totalAssessed) * 100).toFixed(1) : '0';

  const clearedCount = students.filter((s) => s.status === 'CLEARED').length;
  const partialCount = students.filter((s) => s.status === 'PARTIAL').length;
  const overdueStudents = students.filter((s) => s.status === 'OVERDUE');
  const unpaidCount = students.filter((s) => s.status === 'UNPAID').length;

  // Payment mode distribution calculation
  const paymentModeCounts = receipts.reduce((acc: Record<string, number>, r) => {
    const mode = r.paymentMode.replace(/_/g, ' ');
    acc[mode] = (acc[mode] || 0) + r.amountPaidNow;
    return acc;
  }, {});

  const pieData: Array<{ name: string; value: number }> = Object.entries(paymentModeCounts).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  // Quick search handler to jump directly into Collect Fee terminal
  const handleQuickCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    const found = students.find(
      (s) =>
        s.rollNo.toLowerCase().includes(quickSearch.toLowerCase()) ||
        s.name.toLowerCase().includes(quickSearch.toLowerCase())
    );
    if (found) {
      if (onOpenBursarCounter) {
        onOpenBursarCounter(found);
      } else if (onSelectView) {
        onSelectView('BURSAR_SCANNER');
      }
    } else {
      if (onSelectView) onSelectView('BURSAR_SCANNER');
    }
  };

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Department', 'Program', 'Semester', 'Total Fee (INR)', 'Paid (INR)', 'Pending Due (INR)', 'Status'];
    const rows = students.map((s) => [
      s.rollNo,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.degreeProgram}"`,
      s.semester,
      s.totalFee,
      s.paidAmount,
      s.pendingDue,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Collection_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Quick Cashier Action Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 leading-tight">
              Fast Fee Collection Terminal
            </h3>
            <p className="text-xs text-slate-500">
              Lookup student by Roll No or Name to collect fee and issue instant e-receipt.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleQuickCollect} className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Enter Roll No or Name..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </form>

          <button
            type="button"
            onClick={() => onSelectView && onSelectView('BURSAR_SCANNER')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Open Cashier</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportCSV}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer shrink-0"
            title="Export CSV Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Assessed */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="text-slate-500 text-[11px] font-semibold">
            Total Assessed
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 my-1">
            ₹{totalAssessed.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            {students.length} Students
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="text-slate-500 text-[11px] font-semibold flex items-center justify-between">
            <span>Collected Inflows</span>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
              {collectionRate}%
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-700 my-1">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            {clearedCount} Cleared • {partialCount} Partial
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="text-slate-500 text-[11px] font-semibold flex items-center justify-between">
            <span>Pending Receivables</span>
            <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">
              {overdueStudents.length} Overdue
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-700 my-1">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            {unpaidCount} Unpaid • {overdueStudents.length} Overdue
          </div>
        </div>

        {/* Staff Expenditures */}
        <div 
          onClick={onOpenExpenditures}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition cursor-pointer"
        >
          <div className="text-slate-500 text-[11px] font-semibold flex items-center justify-between">
            <span>Staff Expenditures</span>
            <span className="text-[10px] text-slate-400">Outflows</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 my-1">
            ₹{totalExpenditure.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
            <span>{expenses.length} Vouchers</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Net Operating Surplus */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-xs flex flex-col justify-between text-white col-span-2 sm:col-span-1">
          <div className="text-slate-400 text-[11px] font-semibold">
            Net Surplus (In - Out)
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white my-1">
            ₹{netSurplus.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            AY 2025-26 Operating Margin
          </div>
        </div>
      </div>

      {/* Mid Section: Trends & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Collection & Expenditure Trends AreaChart */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col p-4 h-[350px]">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div>
              <h3 className="text-slate-900 font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Monthly Collection Inflows vs Expenditures</span>
              </h3>
              <p className="text-[11px] text-slate-500">Realized student collections vs sanctioned outflows</p>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                <span>Collections</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                <span>Expenses</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FACULTY_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                  name="Collections"
                />
                <Area
                  type="monotone"
                  dataKey="expenditures"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name="Staff Expenditures"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 cols: Payment Mode Shares */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col p-4 h-[350px]">
          <div className="mb-2">
            <h3 className="text-slate-900 font-semibold text-xs sm:text-sm">Payment Channels</h3>
            <p className="text-[11px] text-slate-500">SBI, HDFC, UPI & Cash Counter</p>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 p-1 bg-slate-50 rounded border border-slate-100">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="truncate text-slate-600">{item.name}:</span>
                <span className="font-mono font-semibold text-slate-900 ml-auto">
                  ₹{(item.value / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DEPARTMENTAL MATRIX */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Departmental Recovery Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Department-wise fee assessment, collection inflows, expenditures, and recovery percentage
            </p>
          </div>
          <button
            onClick={onOpenExpenditures}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>View Expenditure Ledger</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Students</th>
                <th className="py-2.5 px-3 text-right">Assessed</th>
                <th className="py-2.5 px-3 text-right">Collected</th>
                <th className="py-2.5 px-3 text-right">Staff Outflow</th>
                <th className="py-2.5 px-3 text-right">Outstanding</th>
                <th className="py-2.5 px-3 text-center">Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {DEPARTMENT_SUMMARIES.map((dept) => (
                <tr key={dept.code} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{dept.department}</div>
                    <span className="text-[10px] font-mono text-slate-400">Code: {dept.code}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                    {dept.totalStudents}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    ₹{(dept.assessed / 100000).toFixed(2)}L
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                    ₹{(dept.collected / 100000).toFixed(2)}L
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    ₹{(dept.expenditure / 100000).toFixed(2)}L
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-700">
                    ₹{(dept.pending / 100000).toFixed(2)}L
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                      dept.clearedRate >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {dept.clearedRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Overdue Section */}
      {overdueStudents.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-rose-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Critical Overdue Defaulters ({overdueStudents.length} Students)
                </h3>
                <p className="text-xs text-slate-500">
                  Fee payments past due date. Intimations and hold rules ready.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenReminders && (
                <button
                  onClick={onOpenReminders}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <BellRing className="w-3.5 h-3.5 text-slate-500" />
                  <span>Send Reminders</span>
                </button>
              )}
              <button
                onClick={() => onOpenDefaultersNotice(overdueStudents)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <span>Notice Intimations</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {overdueStudents.slice(0, 6).map((stu) => (
              <div
                key={stu.id}
                onClick={() => onSelectStudent(stu)}
                className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={stu.avatarUrl}
                    alt={stu.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">{stu.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{stu.rollNo}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-semibold text-rose-700">
                    ₹{stu.pendingDue.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Due: {stu.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

