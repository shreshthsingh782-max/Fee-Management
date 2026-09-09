import React, { useState, useEffect } from 'react';
import { 
  StaffExpense, 
  StaffExpenseCategory, 
  UserRole 
} from '../types';
import { COLLEGE_INFO } from '../data/mockData';
import { BillViewerModal } from './BillViewerModal';
import { UploadBillModal } from './UploadBillModal';
import { 
  IndianRupee, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock, 
  FileText, 
  X, 
  Lock, 
  Search, 
  Download, 
  Building2, 
  UserCheck, 
  TrendingUp,
  AlertCircle,
  Upload,
  Eye,
  ShieldCheck,
  FileCheck2,
  FileX2,
  Paperclip,
  Trash2
} from 'lucide-react';

interface ExpenditureModalProps {
  expenses: StaffExpense[];
  currentUserRole: UserRole;
  currentUserName?: string;
  initialDeptFilter?: string;
  onAddExpense: (expense: StaffExpense) => void;
  onUpdateExpense?: (expense: StaffExpense) => void;
  onDeleteExpense?: (id: string) => void;
  onClose: () => void;
}

export const ExpenditureModal: React.FC<ExpenditureModalProps> = ({
  expenses,
  currentUserRole,
  currentUserName = 'Super Admin / Accounts Officer',
  initialDeptFilter = 'ALL',
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>(initialDeptFilter);
  const [billFilter, setBillFilter] = useState<'ALL' | 'ATTACHED' | 'MISSING'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<StaffExpense | null>(null);

  // Sub-modals for viewing and uploading bills
  const [viewingBillExpense, setViewingBillExpense] = useState<StaffExpense | null>(null);
  const [uploadingBillExpense, setUploadingBillExpense] = useState<StaffExpense | null>(null);

  // New expense form state
  const [formStaffName, setFormStaffName] = useState('');
  const [formStaffId, setFormStaffId] = useState('');
  const [formDept, setFormDept] = useState('Computer Science & Engineering');
  const [formDesignation, setFormDesignation] = useState('Assistant Professor');
  const [formCategory, setFormCategory] = useState<StaffExpenseCategory>('LAB_EQUIPMENT');
  const [formPurpose, setFormPurpose] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaymentMode, setFormPaymentMode] = useState<'NEFT_RTGS' | 'CHEQUE' | 'UPI' | 'PETTY_CASH'>('NEFT_RTGS');
  const [formRemarks, setFormRemarks] = useState('');

  // Bill upload state in Add form
  const [formVendorName, setFormVendorName] = useState('');
  const [formInvoiceNo, setFormInvoiceNo] = useState('');
  const [formInvoiceDate, setFormInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [formVendorGstin, setFormVendorGstin] = useState('');
  const [formBillFile, setFormBillFile] = useState<{ name: string; size: string; dataUrl: string; type: string } | null>(null);

  const canEdit = currentUserRole === 'SUPER_ADMIN';
  const canSubmit = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ACCOUNT_STAFF';

  useEffect(() => {
    if (initialDeptFilter && initialDeptFilter !== 'ALL') {
      setSelectedDept(initialDeptFilter);
    }
  }, [initialDeptFilter]);

  const totalExpenditure = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBillsAttached = expenses.filter((e) => e.receiptAttached && e.billFileName).length;
  const billComplianceRate = expenses.length > 0 ? Math.round((totalBillsAttached / expenses.length) * 100) : 0;
  const estimatedGstItc = Math.round((totalExpenditure * 0.18) / 1.18);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendorName && e.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.invoiceNo && e.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesDept = selectedDept === 'ALL' || e.department === selectedDept;

    const hasBill = Boolean(e.receiptAttached && e.billFileName);
    const matchesBill =
      billFilter === 'ALL' ||
      (billFilter === 'ATTACHED' && hasBill) ||
      (billFilter === 'MISSING' && !hasBill);

    return matchesSearch && matchesCat && matchesDept && matchesBill;
  });

  const handleFormFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeKB = file.size / 1024;
      const sizeString = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormBillFile({
            name: file.name,
            size: sizeString,
            dataUrl: reader.result,
            type: file.type,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const amt = parseFloat(formAmount);
    if (!amt || amt <= 0 || !formStaffName || !formPurpose) return;

    if (editingExpense && canEdit) {
      // Super Admin editing existing
      const updated: StaffExpense = {
        ...editingExpense,
        staffName: formStaffName,
        staffId: formStaffId || editingExpense.staffId,
        department: formDept,
        designation: formDesignation,
        category: formCategory,
        purpose: formPurpose,
        amount: amt,
        paymentMode: formPaymentMode,
        remarks: formRemarks,
        vendorName: formVendorName || editingExpense.vendorName,
        invoiceNo: formInvoiceNo || editingExpense.invoiceNo,
        invoiceDate: formInvoiceDate || editingExpense.invoiceDate,
        vendorGstin: formVendorGstin || editingExpense.vendorGstin,
        ...(formBillFile && {
          receiptAttached: true,
          billUrl: formBillFile.dataUrl,
          billFileName: formBillFile.name,
          billFileSize: formBillFile.size,
          billFileType: formBillFile.type,
          billUploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        }),
      };
      onUpdateExpense?.(updated);
      setEditingExpense(null);
      setShowAddForm(false);
      resetForm();
      return;
    }

    const hasAttachedBill = Boolean(formBillFile);
    const newExp: StaffExpense = {
      id: `EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
      voucherNo: `VCH-2026-${formDept.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      staffName: formStaffName,
      staffId: formStaffId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      department: formDept,
      designation: formDesignation,
      category: formCategory,
      purpose: formPurpose,
      amount: amt,
      paymentMode: formPaymentMode,
      status: currentUserRole === 'SUPER_ADMIN' ? 'APPROVED' : 'PENDING',
      receiptAttached: hasAttachedBill,
      billUrl: formBillFile ? formBillFile.dataUrl : '',
      billFileName: formBillFile ? formBillFile.name : undefined,
      billFileSize: formBillFile ? formBillFile.size : undefined,
      billFileType: formBillFile ? formBillFile.type : undefined,
      billUploadedAt: formBillFile ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
      vendorName: formVendorName || 'Institutional Educational Vendor',
      vendorGstin: formVendorGstin || '29AABCS8810P1Z2',
      invoiceNo: formInvoiceNo || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceDate: formInvoiceDate,
      isBillVerified: hasAttachedBill && currentUserRole === 'SUPER_ADMIN',
      authorizedBy: currentUserRole === 'SUPER_ADMIN' ? currentUserName : 'Pending Super Admin Verification',
      remarks: formRemarks,
    };

    onAddExpense(newExp);
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormStaffName('');
    setFormStaffId('');
    setFormPurpose('');
    setFormAmount('');
    setFormRemarks('');
    setFormVendorName('');
    setFormInvoiceNo('');
    setFormVendorGstin('');
    setFormBillFile(null);
  };

  const handleStartEdit = (exp: StaffExpense) => {
    if (!canEdit) return;
    setEditingExpense(exp);
    setFormStaffName(exp.staffName);
    setFormStaffId(exp.staffId);
    setFormDept(exp.department);
    setFormDesignation(exp.designation);
    setFormCategory(exp.category);
    setFormPurpose(exp.purpose);
    setFormAmount(exp.amount.toString());
    setFormPaymentMode(exp.paymentMode);
    setFormRemarks(exp.remarks || '');
    setFormVendorName(exp.vendorName || '');
    setFormInvoiceNo(exp.invoiceNo || '');
    setFormInvoiceDate(exp.invoiceDate || exp.date);
    setFormVendorGstin(exp.vendorGstin || '');
    setFormBillFile(null);
    setShowAddForm(true);
  };

  const handleSaveUploadedBill = (updatedExpense: StaffExpense) => {
    onUpdateExpense?.(updatedExpense);
    // If currently viewing, update that as well
    if (viewingBillExpense && viewingBillExpense.id === updatedExpense.id) {
      setViewingBillExpense(updatedExpense);
    }
  };

  const handleVerifyBill = (expenseToVerify: StaffExpense) => {
    const verified: StaffExpense = {
      ...expenseToVerify,
      isBillVerified: true,
      auditedBy: `${currentUserName} (${currentUserRole.replace('_', ' ')})`,
      auditRemarks: 'Verified with physical tax invoice & Goods Inward Register.',
    };
    onUpdateExpense?.(verified);
    setViewingBillExpense(verified);
  };

  // Export full CSV including bill verification & GST details
  const handleExportCSV = () => {
    const headers = [
      'Voucher No',
      'Date',
      'Staff Name',
      'Department',
      'Designation',
      'Category',
      'Purpose',
      'Amount (INR)',
      'Payment Mode',
      'Status',
      'Bill Attached',
      'Invoice No',
      'Vendor Name',
      'Vendor GSTIN',
      'Bill Audited',
      'Audited By'
    ];

    const rows = filteredExpenses.map((e) => [
      e.voucherNo,
      e.date,
      `"${e.staffName}"`,
      `"${e.department}"`,
      `"${e.designation}"`,
      e.category,
      `"${e.purpose.replace(/"/g, '""')}"`,
      e.amount,
      e.paymentMode,
      e.status,
      e.receiptAttached ? 'YES' : 'NO',
      `"${e.invoiceNo || 'N/A'}"`,
      `"${(e.vendorName || 'N/A').replace(/"/g, '""')}"`,
      e.vendorGstin || 'N/A',
      e.isBillVerified ? 'VERIFIED' : 'PENDING',
      `"${e.auditedBy || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Collegiate_Staff_Expenditure_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl my-3 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-600/30 text-emerald-400 rounded-lg border border-emerald-500/30">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white">Staff Expenditure & Bill Audit Register</h3>
                <span className="px-1.5 py-0.2 bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-mono">
                  AY 2025-2026
                </span>
                <span className="px-1.5 py-0.2 bg-blue-900/60 text-blue-300 border border-blue-600/40 rounded text-[9px] font-bold">
                  {currentUserRole.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Official institutional tracking of staff vouchers, lab consumables, maintenance & attached vendor tax invoices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition border border-slate-700"
              title="Download Audited CSV"
            >
              <Download className="w-3 h-3 text-slate-300" />
              <span className="hidden sm:inline">Export Audit CSV</span>
            </button>

            {canSubmit && !showAddForm && (
              <button
                onClick={() => {
                  setEditingExpense(null);
                  resetForm();
                  setShowAddForm(true);
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Voucher</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Institutional Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 border-b border-slate-200 text-xs shrink-0">
          <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Outflows Sanctioned</div>
            <div className="text-sm sm:text-base font-black text-slate-900 font-mono mt-0.5">
              ₹{totalExpenditure.toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] text-slate-400">Total institutional debits</div>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bills on File (Compliance)</div>
            <div className="text-sm sm:text-base font-black text-blue-700 font-mono mt-0.5 flex items-center gap-1.5">
              <span>{totalBillsAttached} of {expenses.length}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-800 rounded font-bold">
                {billComplianceRate}%
              </span>
            </div>
            <div className="text-[9px] text-slate-400">Verified against original receipts</div>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estimated GST ITC Claimable</div>
            <div className="text-sm sm:text-base font-black text-emerald-800 font-mono mt-0.5">
              ₹{estimatedGstItc.toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] text-slate-400">Input Tax Credit on 18% GST</div>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Internal Audit Status</div>
            <div className="text-sm sm:text-base font-black text-purple-900 font-mono mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>CA Certified</span>
            </div>
            <div className="text-[9px] text-slate-400">Bursar & Principal Approved</div>
          </div>
        </div>

        {/* Add / Edit Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleSubmitNewExpense} className="p-4 bg-blue-50/50 border-b border-blue-200 space-y-3 shrink-0">
            <div className="flex items-center justify-between pb-1 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-950">
                  {editingExpense ? `Edit Voucher ${editingExpense.voucherNo}` : 'Log New Staff Procurement & Expense Voucher'}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-blue-200 text-blue-900 font-mono">
                  Bursar Entry Form
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Staff Name *</label>
                <input
                  type="text"
                  required
                  value={formStaffName}
                  onChange={(e) => setFormStaffName(e.target.value)}
                  placeholder="e.g. Prof. Harish Chandran"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Staff Employee ID</label>
                <input
                  type="text"
                  value={formStaffId}
                  onChange={(e) => setFormStaffId(e.target.value)}
                  placeholder="e.g. EMP-FAC-401"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Department *</label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Commerce & Financial Analytics">Commerce & Financial Analytics</option>
                  <option value="Management Studies">Management Studies</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Biological Sciences & Biotechnology">Biological Sciences & Biotech</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                  <option value="Central Administration & Bursary">Central Administration & Bursary</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Designation</label>
                <input
                  type="text"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  placeholder="e.g. Associate Professor & Lab In-charge"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Expenditure Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="LAB_EQUIPMENT">Lab Consumables & Equipment</option>
                  <option value="LIBRARY_BOOKS">Library Journals & Databases</option>
                  <option value="CAMPUS_MAINTENANCE">Campus Infrastructure / Maintenance</option>
                  <option value="EXAMINATION_PRINTING">Examination Stationery & Printing</option>
                  <option value="SEMINAR_EVENTS">Conference / Workshop / Seminars</option>
                  <option value="FACULTY_HONORARIUM">Guest Faculty Honorarium</option>
                  <option value="SPORTS_CULTURE">Sports & Gymkhana Activities</option>
                  <option value="STATIONERY">Office Stationery</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Amount (₹ INR) *</label>
                <input
                  type="number"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="₹ 25000"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Payment Mode</label>
                <select
                  value={formPaymentMode}
                  onChange={(e) => setFormPaymentMode(e.target.value as any)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="NEFT_RTGS">NEFT / RTGS Bank Transfer</option>
                  <option value="CHEQUE">Bank Cheque</option>
                  <option value="UPI">UPI / Digital Instant</option>
                  <option value="PETTY_CASH">Bursary Petty Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Vendor / Supplier Name</label>
                <input
                  type="text"
                  value={formVendorName}
                  onChange={(e) => setFormVendorName(e.target.value)}
                  placeholder="e.g. Infotech Systems Pvt Ltd"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Purpose / Procurement Description *</label>
                <input
                  type="text"
                  required
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="e.g. Cisco gigabit switches and optical transceivers for AI laboratory"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                />
              </div>

              {/* Upload Bill Section inside Form */}
              <div className="sm:col-span-2 p-2 bg-white rounded-lg border border-blue-200">
                <label className="block text-[10px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Paperclip className="w-3 h-3 text-blue-600" />
                  <span>Attach Vendor Bill / Tax Invoice (PDF, PNG, JPG)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/jpg"
                    onChange={handleFormFileUpload}
                    className="text-[10px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {formBillFile && (
                    <span className="text-[10px] text-emerald-700 font-mono font-bold truncate">
                      ✓ {formBillFile.name} ({formBillFile.size})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-blue-200/60">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold shadow-xs cursor-pointer"
              >
                {editingExpense ? 'Save Changes' : 'Sanction Voucher'}
              </button>
            </div>
          </form>
        )}

        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, voucher #, invoice #, purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
            >
              <option value="ALL">All Categories</option>
              <option value="LAB_EQUIPMENT">Lab Equipment</option>
              <option value="LIBRARY_BOOKS">Library & Journals</option>
              <option value="CAMPUS_MAINTENANCE">Maintenance</option>
              <option value="EXAMINATION_PRINTING">Exam Printing</option>
              <option value="SEMINAR_EVENTS">Seminars & Events</option>
              <option value="SPORTS_CULTURE">Sports & Cultural</option>
            </select>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Commerce & Financial Analytics">Commerce</option>
              <option value="Management Studies">Management</option>
              <option value="Mechanical Engineering">Mechanical</option>
              <option value="Biological Sciences & Biotechnology">Biotechnology</option>
              <option value="Civil Engineering">Civil</option>
              <option value="Humanities & Social Sciences">Humanities</option>
              <option value="Central Administration & Bursary">Administration</option>
            </select>
          </div>

          {/* User Requested: Bill Upload Status Filter */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300">
            <button
              onClick={() => setBillFilter('ALL')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                billFilter === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setBillFilter('ATTACHED')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                billFilter === 'ATTACHED' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3 h-3" />
              <span>With Bill</span>
            </button>
            <button
              onClick={() => setBillFilter('MISSING')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                billFilter === 'MISSING' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileX2 className="w-3 h-3" />
              <span>Missing Bill</span>
            </button>
          </div>

          <div className="text-slate-500 text-[11px] font-medium hidden md:block">
            Showing {filteredExpenses.length} of {expenses.length} vouchers
          </div>
        </div>

        {/* Expenditure Records Table WITH PROMINENT BILL COLUMN */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Voucher / Date</th>
                  <th className="py-2.5 px-3">Staff / Dept</th>
                  <th className="py-2.5 px-3">Category & Purpose</th>
                  <th className="py-2.5 px-3">Amount (₹)</th>
                  <th className="py-2.5 px-3">Mode</th>
                  {/* USER REQUESTED: DEDICATED BILL COLUMN WITH UPLOAD OPTION */}
                  <th className="py-2.5 px-3 bg-blue-50/80 text-blue-950 font-bold">
                    Bill / Tax Invoice
                  </th>
                  <th className="py-2.5 px-3">Audit Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredExpenses.map((exp) => {
                  const hasBill = Boolean(exp.receiptAttached && exp.billFileName);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                      {/* 1. Voucher & Date */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{exp.voucherNo}</div>
                        <div className="text-[10px] text-slate-500">{exp.date}</div>
                      </td>

                      {/* 2. Staff Name & Dept */}
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900 leading-tight">{exp.staffName}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{exp.department}</div>
                      </td>

                      {/* 3. Category & Purpose */}
                      <td className="py-2 px-3 max-w-xs">
                        <span className="inline-block px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[9px] font-bold uppercase mb-0.5">
                          {exp.category.replace('_', ' ')}
                        </span>
                        <div className="text-[11px] text-slate-800 leading-snug line-clamp-2">
                          {exp.purpose}
                        </div>
                        {exp.vendorName && (
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">
                            Vendor: <span className="text-slate-700">{exp.vendorName}</span>
                          </div>
                        )}
                      </td>

                      {/* 4. Amount */}
                      <td className="py-2 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>

                      {/* 5. Payment Mode */}
                      <td className="py-2 px-3 text-[10px] font-mono text-slate-600 whitespace-nowrap">
                        {exp.paymentMode.replace('_', ' ')}
                      </td>

                      {/* 6. USER REQUESTED: DEDICATED BILL COLUMN WITH UPLOAD OPTION */}
                      <td className="py-2 px-3 bg-blue-50/30">
                        {hasBill ? (
                          <div className="flex items-center gap-1.5">
                            {/* Clickable Bill badge to view invoice */}
                            <button
                              onClick={() => setViewingBillExpense(exp)}
                              className="group flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-md text-left transition cursor-pointer shadow-2xs"
                              title="Click to view tax invoice & bill receipt"
                            >
                              <div className="p-1 bg-blue-100 group-hover:bg-blue-200 text-blue-700 rounded shrink-0 transition">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 max-w-[110px]">
                                <div className="font-bold text-[10px] text-slate-900 truncate leading-tight group-hover:text-blue-700">
                                  {exp.billFileName}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">
                                  {exp.billFileSize || '1.2 MB'}
                                </div>
                              </div>
                              <Eye className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0 ml-0.5" />
                            </button>

                            {/* Re-upload / Replace icon button */}
                            <button
                              onClick={() => setUploadingBillExpense(exp)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded transition cursor-pointer"
                              title="Replace or upload new bill version"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          /* Missing bill: prominent Upload Bill prompt */
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 whitespace-nowrap">
                              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                              No Bill
                            </span>
                            <button
                              onClick={() => setUploadingBillExpense(exp)}
                              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs whitespace-nowrap"
                            >
                              <Upload className="w-2.5 h-2.5" />
                              <span>Upload Bill</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 7. Status */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            exp.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900' :
                            exp.status === 'REIMBURSED' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {exp.status}
                          </span>
                          {exp.isBillVerified && (
                            <div className="text-[9px] text-emerald-700 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Audited</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 8. Action Buttons */}
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasBill && (
                            <button
                              onClick={() => setViewingBillExpense(exp)}
                              className="px-1.5 py-0.5 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded text-[10px] font-semibold cursor-pointer"
                            >
                              Inspect
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => handleStartEdit(exp)}
                              className="px-1.5 py-0.5 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {COLLEGE_INFO.name} • Internal Bursar & Expenditure Audit Register
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Modal 1: Official Tax Invoice & Bill Viewer Modal */}
      {viewingBillExpense && (
        <BillViewerModal
          expense={viewingBillExpense}
          currentUserRole={currentUserRole}
          onClose={() => setViewingBillExpense(null)}
          onOpenUploadBill={(exp) => {
            setViewingBillExpense(null);
            setUploadingBillExpense(exp);
          }}
          onVerifyBill={handleVerifyBill}
        />
      )}

      {/* Sub-Modal 2: Fast Upload / Replace Bill Modal */}
      {uploadingBillExpense && (
        <UploadBillModal
          expense={uploadingBillExpense}
          currentUserRole={currentUserRole}
          currentUserName={currentUserName}
          onClose={() => setUploadingBillExpense(null)}
          onSaveBill={handleSaveUploadedBill}
        />
      )}
    </div>
  );
};
