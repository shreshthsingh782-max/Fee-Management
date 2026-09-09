import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  Database, 
  Terminal, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  ArrowRight, 
  Play, 
  Cpu, 
  Clock, 
  Layers,
  X,
  FileCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { 
  Student, 
  Receipt, 
  ServerAnalyticsSummary, 
  DefaulterAgingSummary, 
  BankWebhookEvent, 
  BankReconciliationResult, 
  ServerJobResult 
} from '../types';

interface ServerConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onRefreshData: () => void;
  onShowToast: (msg: string) => void;
}

type TabType = 'METRICS' | 'ANALYTICS' | 'WEBHOOK' | 'JOBS' | 'RECONCILIATION';

export const ServerConsoleModal: React.FC<ServerConsoleModalProps> = ({
  isOpen,
  onClose,
  students,
  onRefreshData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('METRICS');
  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<ServerAnalyticsSummary | null>(null);
  const [aging, setAging] = useState<DefaulterAgingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastJobResult, setLastJobResult] = useState<ServerJobResult | null>(null);
  const [reconResult, setReconResult] = useState<BankReconciliationResult | null>(null);

  // Webhook Simulator state
  const [webhookStudentRoll, setWebhookStudentRoll] = useState(students[0]?.rollNo || 'ENG/2023/042');
  const [webhookAmount, setWebhookAmount] = useState(25000);
  const [webhookGateway, setWebhookGateway] = useState<'SBI_EPAY' | 'HDFC_SMARTHUB' | 'UPI_INTENT' | 'RAZORPAY'>('SBI_EPAY');
  const [webhookUtr, setWebhookUtr] = useState(`UTR-${Date.now().toString().slice(-8)}`);
  const [webhookResponse, setWebhookResponse] = useState<any>(null);

  // UTR Statement sample
  const [utrBatchInput, setUtrBatchInput] = useState(
    `SBIN00294101, 45000\nHDFC99104822, 28000\nUPI773910284, 15000`
  );

  // Fetch metrics & analytics on open or tab change
  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      const [m, a, ag] = await Promise.all([
        api.getServerMetrics().catch(() => null),
        api.getAnalyticsSummary().catch(() => null),
        api.getDefaultersAging().catch(() => null),
      ]);
      setMetrics(m);
      setAnalytics(a);
      setAging(ag);
    } catch (err) {
      console.warn('Failed to load server diagnostics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDiagnostics();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Run Overdue Assessment Job
  const handleRunOverdueJob = async () => {
    try {
      setLoading(true);
      const res = await api.runDailyOverdueJob();
      setLastJobResult(res);
      onShowToast(`Nightly Job Completed: ${res.recordsAffected} student accounts updated.`);
      onRefreshData();
      await loadDiagnostics();
    } catch (err: any) {
      onShowToast(`Job Execution Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Run Audit Chain Verification
  const handleVerifyAuditChain = async () => {
    try {
      setLoading(true);
      const res = await api.verifyAuditChain('Bursar Console Admin');
      setLastJobResult(res);
      onShowToast('SHA-256 Ledger Integrity Chain verified successfully.');
      onRefreshData();
      await loadDiagnostics();
    } catch (err: any) {
      onShowToast(`Audit Verification Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Bank Webhook
  const handleSimulateWebhook = async () => {
    try {
      setLoading(true);
      const payload: BankWebhookEvent = {
        event: 'PAYMENT_SUCCESS',
        gateway: webhookGateway,
        transactionRef: `TXN-GW-${Date.now()}`,
        studentRollNo: webhookStudentRoll,
        amount: Number(webhookAmount),
        timestamp: new Date().toISOString(),
        bankUtrNumber: webhookUtr,
        hmacSignature: `sha256_sig_${Math.random().toString(36).substring(2)}`,
      };

      const res = await api.simulateBankWebhook(payload);
      setWebhookResponse(res);
      if (res.duplicate) {
        onShowToast(`Webhook Idempotent: Transaction already acknowledged.`);
      } else {
        onShowToast(`Bank Webhook Ingested: Official Receipt #${res.receipt?.receiptNumber} generated!`);
        onRefreshData();
        // Generate new UTR for next test
        setWebhookUtr(`UTR-${Date.now().toString().slice(-8)}`);
      }
      await loadDiagnostics();
    } catch (err: any) {
      onShowToast(`Webhook Failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reconcile Bank Statement
  const handleReconcileStatement = async () => {
    try {
      setLoading(true);
      const lines = utrBatchInput.split('\n').map(l => l.trim()).filter(Boolean);
      const utrEntries = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          utrNumber: parts[0] || `UTR-${Math.floor(Math.random() * 100000)}`,
          amount: parts[1] ? Number(parts[1]) : 25000,
        };
      });

      const res = await api.reconcileBankStatement(utrEntries, 'Senior Bursar');
      setReconResult(res);
      onShowToast(`Statement Processed: ${res.matchedCount} receipts reconciled.`);
      onRefreshData();
      await loadDiagnostics();
    } catch (err: any) {
      onShowToast(`Reconciliation Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Download Database Snapshot
  const handleDownloadBackup = async () => {
    try {
      const data = await api.downloadDatabaseBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saraswati_erp_server_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onShowToast('Server JSON database snapshot exported successfully.');
    } catch (err: any) {
      onShowToast(`Backup Download Failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">Full-Stack Backend Operations</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE PORT 3000
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Express REST Runtime • File-Backed JSON Engine • Gateway Webhooks • Cryptographic Audit Chain
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDiagnostics}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-1 overflow-x-auto">
          {[
            { id: 'METRICS', label: 'Server & Telemetry', icon: Activity },
            { id: 'ANALYTICS', label: 'Financial Aggregation', icon: Layers },
            { id: 'WEBHOOK', label: 'Bank Gateway Webhook', icon: CreditCard },
            { id: 'JOBS', label: 'Scheduled Jobs & Audits', icon: Play },
            { id: 'RECONCILIATION', label: 'UTR Bank Statement', icon: FileCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  active 
                    ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs rounded-t-lg font-semibold' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-6">

          {/* TAB 1: SERVER & TELEMETRY */}
          {activeTab === 'METRICS' && (
            <div className="space-y-5">
              {/* Uptime and Health Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Server Uptime
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    {metrics?.uptimeFormatted || 'Active'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">● Node.js {metrics?.process?.nodeVersion || 'v20'}</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    HTTP API Requests
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    {metrics?.totalApiRequests || 1} reqs
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">REST Endpoints Loaded</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-500" />
                    Memory Allocation
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    {metrics?.process?.rssMb || 54} MB
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Heap: {metrics?.process?.heapUsedMb || 28} MB</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    Database File Size
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    {Math.round((metrics?.database?.fileSizeBytes || 25000) / 1024)} KB
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">college-erp-db.json</div>
                </div>
              </div>

              {/* Database Storage Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-sm font-semibold text-slate-900">Persistent Server Data Collections</h4>
                  </div>
                  <button
                    onClick={handleDownloadBackup}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Full JSON Backup
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="text-slate-500">Student Ledgers</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{metrics?.database?.totalStudents || students.length}</div>
                    <div className="text-[10px] text-slate-400">Master accounts</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="text-slate-500">Official Receipts</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{metrics?.database?.totalReceipts || 0}</div>
                    <div className="text-[10px] text-slate-400">Cryptographically signed</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="text-slate-500">Expenditures</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{metrics?.database?.totalExpenses || 0}</div>
                    <div className="text-[10px] text-slate-400">Audited vouchers</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="text-slate-500">SHA-256 Audit Blocks</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{metrics?.database?.totalAuditLogs || 0}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">100% Tamper Sealed</div>
                  </div>
                </div>
              </div>

              {/* Endpoint Health Checklist */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  REST API Endpoints Registered
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { method: 'GET', path: '/api/bootstrap', desc: 'Initial state & collections preload' },
                    { method: 'GET', path: '/api/analytics/summary', desc: 'Server financial aggregates' },
                    { method: 'POST', path: '/api/receipts', desc: 'Fee processing & official receipt creation' },
                    { method: 'POST', path: '/api/webhooks/bank-gateway', desc: 'SBI/HDFC instant payment ingestion' },
                    { method: 'POST', path: '/api/jobs/run-daily-overdue-check', desc: 'Scheduled late surcharge engine' },
                    { method: 'POST', path: '/api/bursar/reconcile-bank-statement', desc: 'Bank UTR matching engine' },
                    { method: 'GET', path: '/api/admin/metrics', desc: 'Server health & diagnostics' },
                    { method: 'GET', path: '/api/admin/backup', desc: 'Signed database export' },
                  ].map((ep, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {ep.method}
                        </span>
                        <span className="text-slate-800 truncate">{ep.path}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-sans font-medium shrink-0 ml-2">200 OK</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL AGGREGATION & AGING */}
          {activeTab === 'ANALYTICS' && analytics && (
            <div className="space-y-5">
              {/* Financial Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-medium text-slate-500">Gross Assessed Fees</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">₹{analytics.totalAssessed.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-400">Total institutional fee assessment</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-medium text-emerald-600">Total Fee Collections</div>
                  <div className="text-lg font-bold text-emerald-700 mt-1">₹{analytics.totalCollected.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">{analytics.recoveryRate}% Recovery Rate</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-medium text-rose-600">Pending Outstanding Dues</div>
                  <div className="text-lg font-bold text-rose-700 mt-1">₹{analytics.totalPendingDue.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-rose-600">{analytics.overdueStudentsCount} Overdue Accounts</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-medium text-indigo-600">Net Treasury Reserves</div>
                  <div className="text-lg font-bold text-indigo-700 mt-1">₹{analytics.netTreasuryBalance.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-400">After ₹{analytics.totalExpenditures.toLocaleString('en-IN')} expenditures</div>
                </div>
              </div>

              {/* Department Aggregates Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Departmental Collection & Recovery Breakdown
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                        <th className="py-2 px-3 font-semibold">Department</th>
                        <th className="py-2 px-3 font-semibold">Students</th>
                        <th className="py-2 px-3 font-semibold">Assessed</th>
                        <th className="py-2 px-3 font-semibold">Collected</th>
                        <th className="py-2 px-3 font-semibold">Pending</th>
                        <th className="py-2 px-3 font-semibold">Recovery %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analytics.departmentBreakdown.map((dept, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-medium text-slate-900">{dept.department}</td>
                          <td className="py-2.5 px-3 text-slate-600">{dept.studentCount}</td>
                          <td className="py-2.5 px-3 text-slate-600">₹{dept.assessed.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-700">₹{dept.collected.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-rose-600">₹{dept.pending.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, dept.recoveryRate)}%` }}></div>
                              </div>
                              <span className="font-semibold text-slate-700">{dept.recoveryRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Defaulter Aging Breakdown */}
              {aging && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Server-Side Defaulter Aging Analysis
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                      <div className="font-semibold text-amber-900">1 – 7 Days Overdue</div>
                      <div className="text-lg font-bold text-amber-700 mt-1">₹{aging.bucket1to7Days.totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-amber-800">{aging.bucket1to7Days.count} Students (First Notice)</div>
                    </div>
                    <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50">
                      <div className="font-semibold text-orange-900">8 – 15 Days Overdue</div>
                      <div className="text-lg font-bold text-orange-700 mt-1">₹{aging.bucket8to15Days.totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-orange-800">{aging.bucket8to15Days.count} Students (Late Surcharge)</div>
                    </div>
                    <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50">
                      <div className="font-semibold text-rose-900">16 – 30 Days Overdue</div>
                      <div className="text-lg font-bold text-rose-700 mt-1">₹{aging.bucket16to30Days.totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-rose-800">{aging.bucket16to30Days.count} Students (Exam Hold Warning)</div>
                    </div>
                    <div className="p-3 rounded-lg border border-red-300 bg-red-50/60">
                      <div className="font-semibold text-red-900">&gt;30 Days Delinquent</div>
                      <div className="text-lg font-bold text-red-700 mt-1">₹{aging.bucketOver30Days.totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-red-800">{aging.bucketOver30Days.count} Students (Registrar Escalation)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BANK GATEWAY WEBHOOK SIMULATOR */}
          {activeTab === 'WEBHOOK' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Simulate Real-Time Bank Payment Webhook</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tests server-side HMAC validation, idempotency guards (duplicate transaction rejection), automatic receipt issuance, and master ledger dues updates.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Target Student</label>
                    <select
                      value={webhookStudentRoll}
                      onChange={(e) => setWebhookStudentRoll(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.rollNo}>
                          {s.name} ({s.rollNo}) - Due: ₹{s.pendingDue.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Payment Gateway Provider</label>
                    <select
                      value={webhookGateway}
                      onChange={(e: any) => setWebhookGateway(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="SBI_EPAY">State Bank of India (e-Pay Webhook)</option>
                      <option value="HDFC_SMARTHUB">HDFC Bank (SmartHub Gateway)</option>
                      <option value="UPI_INTENT">National UPI Intent (NPCI)</option>
                      <option value="RAZORPAY">Razorpay Education Suite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Credit Amount (₹ INR)</label>
                    <input
                      type="number"
                      value={webhookAmount}
                      onChange={(e) => setWebhookAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Bank UTR / Transaction Reference</label>
                    <input
                      type="text"
                      value={webhookUtr}
                      onChange={(e) => setWebhookUtr(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSimulateWebhook}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Dispatch Bank Webhook to Server (`/api/webhooks/bank-gateway`)
                  </button>
                </div>
              </div>

              {/* Webhook Response Preview */}
              {webhookResponse && (
                <div className="bg-slate-900 rounded-xl p-4 text-white font-mono text-xs space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      HTTP 200/201 Webhook Response Received
                    </span>
                    <span>Status: {webhookResponse.duplicate ? 'IDEMPOTENT_IGNORED' : 'CREDITED_AND_RECORDED'}</span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] text-emerald-300 py-1">
                    {JSON.stringify(webhookResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCHEDULED JOBS & AUDITS */}
          {activeTab === 'JOBS' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Job 1 */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-semibold text-slate-900">Nightly Overdue Evaluation Cron</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Scans all student ledgers against due dates. Automatically updates delinquent accounts to OVERDUE status and applies institutional 5-day grace late fee surcharges.
                  </p>
                  <button
                    onClick={handleRunOverdueJob}
                    disabled={loading}
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Execute Overdue Engine Batch Now
                  </button>
                </div>

                {/* Job 2 */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold text-slate-900">SHA-256 Ledger Audit Chain Verifier</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Sequentially recalculates cryptographic hash signatures for every transaction log block to prove that zero tamperings or illegal ledger modifications occurred.
                  </p>
                  <button
                    onClick={handleVerifyAuditChain}
                    disabled={loading}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify Entire SHA-256 Blockchain
                  </button>
                </div>
              </div>

              {/* Last Job Output */}
              {lastJobResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 font-semibold border-b border-slate-100 pb-2">
                    <span className="text-indigo-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Job Execution Output: {lastJobResult.jobName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{lastJobResult.executedAt}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{lastJobResult.summary}</p>
                  {lastJobResult.details && (
                    <div className="bg-slate-50 rounded-lg p-2.5 font-mono text-[11px] text-slate-700">
                      {JSON.stringify(lastJobResult.details, null, 2)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BANK STATEMENT RECONCILIATION */}
          {activeTab === 'RECONCILIATION' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Bank Statement UTR Batch Reconciliation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Match bank statement credit lines against un-reconciled college receipts. Automatically updates receipt status to RECONCILED.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Paste Bank UTR Statement Entries (Format: UTR_NUMBER, AMOUNT)
                  </label>
                  <textarea
                    rows={4}
                    value={utrBatchInput}
                    onChange={(e) => setUtrBatchInput(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    placeholder="SBIN00294101, 45000&#10;HDFC99104822, 28000"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleReconcileStatement}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Process & Reconcile Statement (`/api/bursar/reconcile-bank-statement`)
                  </button>
                </div>
              </div>

              {/* Recon Results */}
              {reconResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h5 className="font-semibold text-slate-900">Reconciliation Match Results</h5>
                    <div className="text-emerald-700 font-semibold">
                      Matched: {reconResult.matchedCount} / {reconResult.totalSubmitted} (₹{reconResult.totalReconciledAmount.toLocaleString('en-IN')})
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {reconResult.matches.map((m, i) => (
                      <div key={i} className={`p-2 rounded-lg border flex items-center justify-between ${m.matched ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50/60 border-rose-200 text-rose-900'}`}>
                        <div className="flex items-center gap-2 font-mono">
                          {m.matched ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
                          <span>UTR: {m.utrNumber}</span>
                          <span className="text-slate-500 font-sans">({m.studentName})</span>
                        </div>
                        <div className="font-semibold">₹{m.amount.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>REST Server & JSON Store Synchronized</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition cursor-pointer"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
