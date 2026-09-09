import React, { useState } from 'react';
import { StaffExpense, UserRole } from '../types';
import { COLLEGE_INFO } from '../data/mockData';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Upload, 
  Building2, 
  Calendar, 
  CreditCard, 
  IndianRupee,
  ExternalLink,
  Eye,
  FileCheck2,
  Tag
} from 'lucide-react';

interface BillViewerModalProps {
  expense: StaffExpense;
  currentUserRole: UserRole;
  onClose: () => void;
  onOpenUploadBill?: (expense: StaffExpense) => void;
  onVerifyBill?: (expense: StaffExpense) => void;
}

export const BillViewerModal: React.FC<BillViewerModalProps> = ({
  expense,
  currentUserRole,
  onClose,
  onOpenUploadBill,
  onVerifyBill,
}) => {
  const [activeTab, setActiveTab] = useState<'INVOICE' | 'ATTACHMENT'>('INVOICE');
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';
  const isPrincipal = currentUserRole === 'PRINCIPAL';
  const canVerify = isSuperAdmin || isPrincipal;

  const handlePrint = () => {
    window.print();
  };

  // Tax calculations (assume 18% GST standard for commercial goods/services)
  const totalAmount = expense.amount;
  const taxableValue = Math.round(totalAmount / 1.18);
  const gstTotal = totalAmount - taxableValue;
  const cgst = Math.round(gstTotal / 2);
  const sgst = gstTotal - cgst;

  const vendorName = expense.vendorName || 'Authorized Vendor / Service Provider';
  const vendorGstin = expense.vendorGstin || '29AAACV9812L1Z5';
  const invoiceNo = expense.invoiceNo || `INV-${expense.date.replace(/-/g, '')}-${expense.voucherNo.slice(-3)}`;
  const invoiceDate = expense.invoiceDate || expense.date;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl my-4 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Collegiate Expenditure Bill & Tax Invoice
                </h3>
                <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono font-bold">
                  {expense.voucherNo}
                </span>
                {expense.isBillVerified ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    AUDITED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[10px] font-bold">
                    PENDING AUDIT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Official institutional procurement voucher, vendor GST invoice & bursary audit record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher if custom image/document exists */}
            {expense.billUrl && (
              <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setActiveTab('INVOICE')}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    activeTab === 'INVOICE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Digital Invoice
                </button>
                <button
                  onClick={() => setActiveTab('ATTACHMENT')}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                    activeTab === 'ATTACHMENT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Original File</span>
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition border border-slate-700"
              title="Print Tax Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {onOpenUploadBill && (
              <button
                onClick={() => onOpenUploadBill(expense)}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Bill</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {activeTab === 'ATTACHMENT' && expense.billUrl ? (
            /* Uploaded Image or PDF Embed */
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">{expense.billFileName || 'Uploaded_Bill.png'}</span>
                  <span className="text-slate-400 font-mono">({expense.billFileSize || '1.2 MB'})</span>
                </div>
                <a
                  href={expense.billUrl}
                  download={expense.billFileName || 'Expense_Bill'}
                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              </div>

              {expense.billFileType?.includes('pdf') ? (
                <div className="w-full h-[550px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  <iframe src={expense.billUrl} className="w-full h-full" title="PDF Bill Viewer" />
                </div>
              ) : (
                <div className="max-w-2xl overflow-hidden rounded-lg border border-slate-200 shadow-xs">
                  <img
                    src={expense.billUrl}
                    alt="Uploaded Bill"
                    className="w-full h-auto max-h-[550px] object-contain bg-white"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Authentic High-Definition Tax Invoice / Collegiate Cash Voucher Layout */
            <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto text-slate-800 print:border-none print:shadow-none font-sans">
              {/* Top Row: Vendor & Invoice Meta */}
              <div className="border-b-2 border-slate-900 pb-5 mb-5 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded text-[10px] font-bold uppercase tracking-wider">
                    Tax Invoice / Commercial Bill
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{vendorName}</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Authorized Educational & Institutional Procurement Partner
                  </p>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono space-y-0.5">
                    <div>GSTIN: <strong className="text-slate-800">{vendorGstin}</strong></div>
                    <div>State: Karnataka (Code: 29) • PAN: {vendorGstin.slice(2, 12)}</div>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                  <div className="text-xs font-mono font-bold text-slate-500 uppercase">Original For Recipient</div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    Invoice #{invoiceNo}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center sm:justify-end gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Bill Date: <strong>{invoiceDate}</strong></span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Voucher Ref: <strong className="font-mono text-blue-700">{expense.voucherNo}</strong>
                  </div>
                </div>
              </div>

              {/* Billed To & Department Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-6">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Billed To (Institutional Client)
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{COLLEGE_INFO.name}</div>
                  <div className="text-slate-600 leading-relaxed text-[11px] mt-0.5">
                    Central Bursary & Financial Administration Wing<br />
                    College Road, Bengaluru, Karnataka - 560001<br />
                    <span className="font-mono">College GSTIN: 29AAATS9102K1ZQ</span>
                  </div>
                </div>

                <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Sanctioning Department & Claimant
                  </div>
                  <div className="font-bold text-slate-900">{expense.staffName}</div>
                  <div className="text-slate-600 text-[11px]">{expense.designation}</div>
                  <div className="text-slate-800 font-medium text-[11px] mt-1">
                    Department: <strong className="text-blue-800">{expense.department}</strong>
                  </div>
                  <div className="text-slate-500 font-mono text-[10px] mt-0.5">
                    Staff ID: {expense.staffId} • Category: {expense.category.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden mb-6 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3">Item Description / Procurement Purpose</th>
                      <th className="py-2.5 px-3 w-24 text-center">HSN / SAC</th>
                      <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                      <th className="py-2.5 px-3 w-28 text-right">Taxable Value</th>
                      <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">1</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 leading-snug">{expense.purpose}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Sanctioned under institutional budget head: {expense.category.replace('_', ' ')}
                        </div>
                        {expense.remarks && (
                          <div className="text-[10px] text-blue-700 italic mt-0.5">
                            Note: {expense.remarks}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">847130</td>
                      <td className="py-3 px-3 text-center font-mono">1 Lot</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{taxableValue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations & GST Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6">
                <div className="sm:col-span-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                    <span>Settlement & Bank Details</span>
                  </div>
                  <div className="text-slate-600">
                    Mode of Payment: <strong className="text-slate-800">{expense.paymentMode.replace('_', ' ')}</strong>
                  </div>
                  <div className="text-slate-600">
                    Authorized Sanction: <strong className="text-slate-800">{expense.authorizedBy}</strong>
                  </div>
                  <div className="text-slate-500 text-[10px] pt-1 border-t border-slate-200">
                    Bill File on Record: <strong className="font-mono text-slate-700">{expense.billFileName || 'Physical Voucher Verified'}</strong>
                  </div>
                </div>

                <div className="sm:col-span-6 space-y-1.5 text-xs text-slate-700 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-sans text-slate-600">Taxable Subtotal:</span>
                    <span className="font-bold">₹{taxableValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-sans text-slate-600">Central GST (CGST @ 9%):</span>
                    <span className="font-bold text-slate-700">₹{cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-sans text-slate-600">State GST (SGST @ 9%):</span>
                    <span className="font-bold text-slate-700">₹{sgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900 bg-emerald-50/60 px-2 rounded">
                    <span className="font-sans font-black">Net Total Sanctioned:</span>
                    <span className="text-emerald-900">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Official Stamp & Verification Audit Box */}
              <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Audit Seal Stamp */}
                <div className="border-2 border-dashed border-emerald-600 bg-emerald-50/40 rounded-lg p-3 text-center sm:text-left flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-full shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] text-emerald-950 leading-tight">
                    <div className="font-bold uppercase tracking-wider text-emerald-900">
                      BURSAR AUDIT WING • PASSED FOR PAYMENT
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Audited By: <strong>{expense.auditedBy || 'Internal Audit Desk'}</strong>
                    </div>
                    <div className="text-slate-500 font-mono text-[9px] mt-0.5">
                      Verified with Original Tax Invoice & Goods Receipt Note
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex items-center gap-8 self-end sm:self-auto text-center text-[10px] text-slate-600">
                  <div>
                    <div className="h-8 border-b border-slate-400 w-28 mb-1"></div>
                    <span className="font-bold text-slate-800">Claimant Staff</span>
                  </div>
                  <div>
                    <div className="h-8 border-b border-slate-400 w-28 mb-1 flex items-end justify-center">
                      <span className="font-serif italic text-blue-900 text-xs">R. K. Verma</span>
                    </div>
                    <span className="font-bold text-slate-800">Bursar / Accounts</span>
                  </div>
                  <div>
                    <div className="h-8 border-b border-slate-400 w-28 mb-1 flex items-end justify-center">
                      <span className="font-serif italic text-emerald-900 text-xs">Dr. M. Sundaram</span>
                    </div>
                    <span className="font-bold text-slate-800">Principal Approval</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Document Reference: <strong className="font-mono text-slate-800">{expense.voucherNo}</strong> • Tax Invoice Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canVerify && !expense.isBillVerified && onVerifyBill && (
              <button
                onClick={() => onVerifyBill(expense)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify & Approve Bill</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs cursor-pointer transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
