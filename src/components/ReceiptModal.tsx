import React, { useRef } from 'react';
import { Receipt } from '../types';
import { COLLEGE_INFO } from '../data/mockData';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Printer, 
  Download, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  X, 
  CreditCard, 
  FileText,
  Copy,
  Check
} from 'lucide-react';

interface ReceiptModalProps {
  receipt: Receipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(receipt.transactionRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(receipt.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-4 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Action Header bar (hidden in print) */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-emerald-100 text-emerald-800 rounded">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Official Fee Receipt Voucher</h3>
              <p className="text-[10px] text-slate-500">Ref #{receipt.receiptNumber} • Automated Instant Issuance</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-700 rounded hover:bg-blue-800 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Receipt Body */}
        <div className="overflow-y-auto p-4 md:p-6 space-y-4 text-slate-800 bg-white" ref={printRef}>
          {/* College Header */}
          <div className="border-b-2 border-slate-900 pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs border border-slate-700">
                  <Building2 className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                    {COLLEGE_INFO.name}
                  </h1>
                  <p className="text-[11px] font-medium text-slate-600">{COLLEGE_INFO.accreditation}</p>
                  <p className="text-[10px] text-slate-500">{COLLEGE_INFO.address}</p>
                </div>
              </div>
              <div className="text-left sm:text-right bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                <div className="font-mono font-bold text-slate-900">BURSAR'S OFFICE</div>
                <div className="text-slate-500">Institution Code: <span className="font-semibold text-slate-700">{COLLEGE_INFO.code}</span></div>
                <div className="text-emerald-700 font-bold flex items-center sm:justify-end gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified & Sealed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Meta Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Receipt No.</span>
              <span className="font-mono font-bold text-blue-900 text-xs">{receipt.receiptNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Date of Payment</span>
              <span className="font-semibold text-slate-800 text-xs">{formattedDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Academic Session</span>
              <span className="font-semibold text-slate-800 text-xs">{receipt.academicYear} • Sem {receipt.semester}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Settlement Status</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● {receipt.status}
              </span>
            </div>
          </div>

          {/* Student Profile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border border-slate-200 p-3 rounded-lg bg-white shadow-2xs">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold text-slate-900">{receipt.studentName}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Roll No:</span>
                <span className="font-mono font-bold text-slate-800">#{receipt.rollNo}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Student ID:</span>
                <span className="font-mono text-slate-700">{receipt.studentId}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Program:</span>
                <span className="font-semibold text-slate-800">{receipt.degreeProgram}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Department:</span>
                <span className="text-slate-700">{receipt.department}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Channel:</span>
                <span className="font-medium text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                  {receipt.paymentMode.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Itemized Fee Assessment & Schedule</span>
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-1.5 px-3 w-10 text-center">#</th>
                    <th className="py-1.5 px-3">Fee Category</th>
                    <th className="py-1.5 px-3">Particulars / Description</th>
                    <th className="py-1.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipt.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-1 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-1 px-3 font-semibold text-slate-800">{item.category}</td>
                      <td className="py-1 px-3 text-slate-600 text-[11px]">{item.description}</td>
                      <td className="py-1 px-3 text-right font-mono font-medium text-slate-900">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/70 border-t border-slate-200">
                    <td colSpan={3} className="py-1.5 px-3 text-right font-medium text-slate-600 text-[11px]">Gross Assessment:</td>
                    <td className="py-1.5 px-3 text-right font-mono font-semibold text-slate-900 text-xs">
                      ₹{receipt.subtotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  {receipt.scholarshipDiscount > 0 && (
                    <tr className="bg-emerald-50/50">
                      <td colSpan={3} className="py-1 px-3 text-right font-medium text-emerald-800 text-[11px]">
                        Scholarship / Merit Concession:
                      </td>
                      <td className="py-1 px-3 text-right font-mono font-semibold text-emerald-800 text-xs">
                        -₹{receipt.scholarshipDiscount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  {receipt.lateFee > 0 && (
                    <tr className="bg-rose-50/50">
                      <td colSpan={3} className="py-1 px-3 text-right font-medium text-rose-800 text-[11px]">
                        Late Surcharge Fee:
                      </td>
                      <td className="py-1 px-3 text-right font-mono font-semibold text-rose-800 text-xs">
                        +₹{receipt.lateFee.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={3} className="py-2 px-3 text-right text-xs">AMOUNT RECEIVED & RECORDED:</td>
                    <td className="py-2 px-3 text-right font-mono text-sm text-amber-300">
                      ₹{receipt.amountPaidNow.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-slate-100 text-slate-700">
                    <td colSpan={3} className="py-1.5 px-3 text-right font-semibold text-[11px]">Remaining Balance Due:</td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                      {receipt.balanceRemaining === 0 ? (
                        <span className="text-emerald-700 font-bold">NIL (Fully Cleared)</span>
                      ) : (
                        `₹${receipt.balanceRemaining.toLocaleString('en-IN')}`
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Transaction Verification & Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block font-medium text-[10px]">Banking Gateway / Branch:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <CreditCard className="w-3 h-3 text-blue-700" />
                {receipt.bankName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium text-[10px]">Transaction Ref / UTR:</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-mono font-bold text-slate-800">{receipt.transactionRef}</span>
                <button
                  onClick={handleCopyRef}
                  className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer print:hidden"
                  title="Copy reference ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block font-medium text-[10px]">Payment Authorization:</span>
              <span className="font-semibold text-slate-800 block mt-0.5">{receipt.authorizedBy}</span>
            </div>
          </div>

          {/* Verification QR & Digital Seal Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                <QRCodeSVG
                  value={`VERIFIED_RECEIPT:${receipt.receiptNumber}:${receipt.studentId}:${receipt.amountPaidNow}:${receipt.transactionRef}`}
                  size={52}
                  level="M"
                />
              </div>
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Tamper-Proof Digital Verification
                </p>
                <p className="text-[10px] text-slate-500 max-w-xs leading-tight">
                  Scan to verify authentic collegiate ledger entry. System-generated electronic voucher. No physical signature required.
                </p>
              </div>
            </div>

            {/* Official Collegiate Seal simulation */}
            <div className="text-center sm:text-right border border-dashed border-blue-300 bg-blue-50/50 p-2 rounded-lg">
              <div className="text-[9px] uppercase font-bold tracking-widest text-blue-900">BURSAR SEAL OF ACCOUNTS</div>
              <div className="font-serif italic font-bold text-[11px] text-slate-700 mt-0.5">Metropolitan Apex Degree College</div>
              <div className="text-[9px] text-emerald-700 font-mono font-semibold">ELECTRONICALLY AUTHORIZED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
