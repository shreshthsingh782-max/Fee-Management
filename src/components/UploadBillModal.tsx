import React, { useState, useRef } from 'react';
import { StaffExpense, UserRole } from '../types';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  FileCheck, 
  Building2, 
  Receipt as ReceiptIcon,
  Sparkles,
  Eye
} from 'lucide-react';

interface UploadBillModalProps {
  expense: StaffExpense;
  currentUserRole: UserRole;
  currentUserName?: string;
  onClose: () => void;
  onSaveBill: (updatedExpense: StaffExpense) => void;
}

export const UploadBillModal: React.FC<UploadBillModalProps> = ({
  expense,
  currentUserRole,
  currentUserName = 'Accounts Staff',
  onClose,
  onSaveBill,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>(expense.billUrl || '');
  const [fileName, setFileName] = useState<string>(expense.billFileName || '');
  const [fileSize, setFileSize] = useState<string>(expense.billFileSize || '');
  const [fileType, setFileType] = useState<string>(expense.billFileType || '');

  // Form fields
  const [vendorName, setVendorName] = useState<string>(
    expense.vendorName || (expense.category === 'LAB_EQUIPMENT' ? 'HiMedia Laboratories Ltd' : 'Universal Educational Supplies')
  );
  const [invoiceNo, setInvoiceNo] = useState<string>(
    expense.invoiceNo || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(
    expense.invoiceDate || expense.date || new Date().toISOString().slice(0, 10)
  );
  const [vendorGstin, setVendorGstin] = useState<string>(
    expense.vendorGstin || '29AABCS8810P1Z2'
  );
  const [auditNotes, setAuditNotes] = useState<string>(
    expense.auditRemarks || 'Physical bill verified against stock ledger.'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please upload a smaller scan or PDF.');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload PDF, PNG, or JPEG documents.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setFileType(file.type);

    // Human-readable size
    const sizeKB = file.size / 1024;
    const sizeString = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
    setFileSize(sizeString);

    // Read as Data URL for browser preview and persistence
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileDataUrl('');
    setFileName('');
    setFileSize('');
    setFileType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If no new file selected and no previous file, warn or create default simulated document
    const finalFileName = fileName || `Bill_${expense.voucherNo}.pdf`;
    const finalFileSize = fileSize || '1.2 MB';
    const finalFileType = fileType || 'application/pdf';

    const updatedExpense: StaffExpense = {
      ...expense,
      receiptAttached: true,
      billUrl: fileDataUrl || expense.billUrl || '',
      billFileName: finalFileName,
      billFileSize: finalFileSize,
      billFileType: finalFileType,
      billUploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      vendorName: vendorName.trim(),
      vendorGstin: vendorGstin.trim(),
      invoiceNo: invoiceNo.trim(),
      invoiceDate,
      isBillVerified: currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'PRINCIPAL',
      auditedBy: `${currentUserName} (${currentUserRole.replace('_', ' ')})`,
      auditRemarks: auditNotes.trim(),
    };

    onSaveBill(updatedExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl my-4 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                Upload Expense Bill & GST Tax Invoice
              </h3>
              <p className="text-[10px] text-slate-400">
                Attach vendor invoice to Voucher #{expense.voucherNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {/* Voucher Summary Strip */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9px]">Voucher No</span>
              <strong className="text-slate-900 font-mono">{expense.voucherNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">Staff / Dept</span>
              <span className="text-slate-800 font-semibold truncate block">{expense.staffName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">Amount</span>
              <strong className="text-emerald-700 font-mono">₹{expense.amount.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">Category</span>
              <span className="text-slate-700 truncate block">{expense.category.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Select or Drop Bill / Receipt Document *
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : fileName
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {fileName ? (
                <div className="flex flex-col items-center space-y-1.5 w-full">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-full">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-slate-900 text-xs truncate max-w-sm">
                    {fileName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Size: {fileSize} • Type: {fileType || 'Document'}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700">
                      Click to choose different file
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1 text-[10px] flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full inline-flex mb-1">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-slate-800 text-xs">
                    Drop invoice here, or <span className="text-blue-600 underline">browse files</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Supports GST Tax Invoices in PDF, PNG, JPG, or JPEG (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[10px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Vendor and Invoice Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                Vendor / Supplier Name *
              </label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Infotech Solutions Pvt Ltd"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                Invoice / Bill Number *
              </label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. INV-2026-9921"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                Vendor GSTIN (15 Digits)
              </label>
              <input
                type="text"
                value={vendorGstin}
                onChange={(e) => setVendorGstin(e.target.value)}
                placeholder="29AAACV9812L1Z5"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono uppercase focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                Bursary Audit Notes / Remarks
              </label>
              <input
                type="text"
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="e.g. Original physical receipt verified and stamped by internal auditor"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-xs font-medium cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Attach & Save Bill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
