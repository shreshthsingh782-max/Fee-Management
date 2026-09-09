import React, { useState } from 'react';
import { 
  ScholarshipApplication, 
  ScholarshipCategory, 
  Student, 
  UserRole 
} from '../types';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Plus, 
  IndianRupee, 
  X, 
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Building,
  Upload
} from 'lucide-react';

interface ScholarshipWaiverModalProps {
  applications: ScholarshipApplication[];
  students: Student[];
  currentUserRole: UserRole;
  currentUserName: string;
  onClose: () => void;
  onApproveApplication: (appId: string, approvedAmount: number, remarks: string) => void;
  onRejectApplication: (appId: string, remarks: string) => void;
  onSubmitApplication: (app: Omit<ScholarshipApplication, 'id' | 'status' | 'appliedDate'>) => void;
}

export const ScholarshipWaiverModal: React.FC<ScholarshipWaiverModalProps> = ({
  applications,
  students,
  currentUserRole,
  currentUserName,
  onClose,
  onApproveApplication,
  onRejectApplication,
  onSubmitApplication,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'APPLY'>('PENDING');

  // Review state
  const [selectedApp, setSelectedApp] = useState<ScholarshipApplication | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [sanctionAmount, setSanctionAmount] = useState<number>(0);
  const [reviewRemarks, setReviewRemarks] = useState<string>('');

  // New application form state (for student or staff applying on behalf)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [category, setCategory] = useState<ScholarshipCategory>('MERIT');
  const [requestedAmount, setRequestedAmount] = useState<number>(10000);
  const [reason, setReason] = useState<string>('');
  const [docName, setDocName] = useState<string>('Income_Or_Marksheet_Certificate.pdf');

  const pendingApps = applications.filter((a) => a.status === 'PENDING');
  const processedApps = applications.filter((a) => a.status === 'APPROVED' || a.status === 'REJECTED');

  const canApprove = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'PRINCIPAL';

  const handleOpenAction = (app: ScholarshipApplication, type: 'APPROVE' | 'REJECT') => {
    setSelectedApp(app);
    setActionType(type);
    setSanctionAmount(app.requestedAmount);
    setReviewRemarks(
      type === 'APPROVE'
        ? `Sanctioned under Collegiate Welfare & Merit Endowment Fund by ${currentUserName}`
        : 'Does not satisfy minimal documentary eligibility criteria for current semester.'
    );
  };

  const handleConfirmAction = () => {
    if (!selectedApp || !actionType) return;
    if (actionType === 'APPROVE') {
      onApproveApplication(selectedApp.id, sanctionAmount, reviewRemarks);
    } else {
      onRejectApplication(selectedApp.id, reviewRemarks);
    }
    setSelectedApp(null);
    setActionType(null);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    onSubmitApplication({
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      department: student.department,
      category,
      requestedAmount,
      reason,
      documentName: docName,
    });

    setReason('');
    setActiveTab('PENDING');
  };

  const getCategoryLabel = (cat: ScholarshipCategory) => {
    switch (cat) {
      case 'MERIT': return 'Merit / Academic Excellence';
      case 'EWS_AID': return 'Economically Weaker Section (EWS Aid)';
      case 'SPORTS_QUOTA': return 'Inter-University Sports Quota';
      case 'FACULTY_WARD': return 'Faculty / Institutional Ward';
      case 'SPECIAL_CONCESSION': return 'Special Administrative Concession';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Scholarships, Waivers & Fee Concessions</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-400/20 text-purple-200 border border-purple-400/30">
                  Welfare Portal
                </span>
              </div>
              <p className="text-xs text-purple-200">
                Merit endowments, EWS concessions, sports waivers & administrative fee adjustments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1 rounded-lg hover:bg-purple-800/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex items-center justify-between shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review ({pendingApps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'APPROVED'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sanction History ({processedApps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('APPLY')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'APPLY'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Concession Request</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block">
            Logged in as: <strong className="text-slate-700">{currentUserRole.replace('_', ' ')}</strong>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: PENDING */}
          {activeTab === 'PENDING' && (
            <div className="space-y-3">
              {pendingApps.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                  All scholarship and waiver applications have been processed!
                </div>
              ) : (
                pendingApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          {getCategoryLabel(app.category)}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">{app.rollNo}</span>
                        <span className="text-xs text-slate-600 font-medium">• {app.studentName}</span>
                        <span className="text-[11px] text-slate-400">({app.department})</span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {app.reason}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="font-semibold text-purple-900">
                          Requested Concession: <strong className="font-mono text-sm">₹{app.requestedAmount.toLocaleString('en-IN')}</strong>
                        </span>
                        {app.documentName && (
                          <span className="flex items-center gap-1 text-slate-600 text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>{app.documentName}</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          Applied: {app.appliedDate}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                      {canApprove ? (
                        <>
                          <button
                            onClick={() => handleOpenAction(app, 'APPROVE')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sanction</span>
                          </button>
                          <button
                            onClick={() => handleOpenAction(app, 'REJECT')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          Requires Principal / Admin Approval
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PROCESSED HISTORY */}
          {activeTab === 'APPROVED' && (
            <div className="space-y-3">
              {processedApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {app.status}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{app.rollNo}</span>
                      <span className="text-slate-700 font-medium">{app.studentName}</span>
                      <span className="text-slate-400">({app.department})</span>
                    </div>

                    <p className="text-slate-600 text-[11px]">{app.reason}</p>

                    {app.remarks && (
                      <p className="text-purple-900 bg-purple-50 p-2 rounded text-[11px] border border-purple-100">
                        <strong>Official Order:</strong> {app.remarks} (Reviewed by: {app.reviewedBy || 'Authorized Officer'})
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      ₹{(app.approvedAmount || app.requestedAmount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">Date: {app.reviewDate || app.appliedDate}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: NEW APPLICATION */}
          {activeTab === 'APPLY' && (
            <form onSubmit={handleSubmitNew} className="max-w-xl mx-auto space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Apply for Student Fee Concession or Scholarship</h3>
                <p className="text-xs text-slate-500">Applications are reviewed and sanctioned by the Central Academic & Bursary Board.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Beneficiary Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rollNo} - {s.name} ({s.department}, Pending: ₹{s.pendingDue.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Concession Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ScholarshipCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="MERIT">Merit / Academic Excellence</option>
                    <option value="EWS_AID">Economically Weaker Section (EWS)</option>
                    <option value="SPORTS_QUOTA">Sports Quota / University Representation</option>
                    <option value="FACULTY_WARD">Institutional Staff Ward</option>
                    <option value="SPECIAL_CONCESSION">Special Administrative Relief</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Amount (₹)</label>
                  <input
                    type="number"
                    min={1000}
                    max={100000}
                    step={500}
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Statement of Justification / Merit Details</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State academic marks, GPA, annual household income, or sporting honors supporting this request..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supporting Document Attachment</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-700"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-300 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Submit Application for Review
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Action Confirmation Modal (Approve or Reject) */}
        {selectedApp && actionType && (
          <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {actionType === 'APPROVE' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Sanction Fee Concession
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Reject Concession Request
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div>Student: <strong>{selectedApp.studentName}</strong> ({selectedApp.rollNo})</div>
                <div>Category: <span className="font-semibold text-purple-700">{getCategoryLabel(selectedApp.category)}</span></div>
                <div>Original Request: ₹{selectedApp.requestedAmount.toLocaleString('en-IN')}</div>
              </div>

              {actionType === 'APPROVE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approved Sanction Amount (₹)</label>
                  <input
                    type="number"
                    value={sanctionAmount}
                    onChange={(e) => setSanctionAmount(Number(e.target.value))}
                    max={selectedApp.requestedAmount}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This amount will immediately reduce student pending dues on the central ledger.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Executive Remarks</label>
                <textarea
                  rows={2}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-1.5 text-white rounded-lg text-xs font-bold transition cursor-pointer ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {actionType === 'APPROVE' ? 'Sanction' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
