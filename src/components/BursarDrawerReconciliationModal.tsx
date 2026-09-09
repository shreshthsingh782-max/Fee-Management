import React, { useState } from 'react';
import { DrawerClosing, Receipt, UserProfile } from '../types';
import { COLLEGE_INFO } from '../data/mockData';
import { 
  Building2, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Printer, 
  X, 
  IndianRupee, 
  ShieldCheck, 
  Coins, 
  CreditCard, 
  QrCode,
  ArrowRight
} from 'lucide-react';

interface BursarDrawerReconciliationModalProps {
  receipts: Receipt[];
  currentUser: UserProfile;
  onClose: () => void;
  onSubmitClosing: (closing: DrawerClosing) => void;
}

const DENOMINATIONS = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

export const BursarDrawerReconciliationModal: React.FC<BursarDrawerReconciliationModalProps> = ({
  receipts,
  currentUser,
  onClose,
  onSubmitClosing,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [openingFloat, setOpeningFloat] = useState<number>(5000);
  const [denominations, setDenominations] = useState<Record<string, number>>({
    '500': 20,
    '200': 15,
    '100': 10,
    '50': 0,
    '20': 0,
    '10': 0,
  });
  const [bankName, setBankName] = useState('State Bank of India (Malleshwaram Institutional Branch, A/C: 38920194812)');
  const [notes, setNotes] = useState('All daily counter cash receipts tallied with Pine Labs physical terminal roll.');
  const [showChallanPreview, setShowChallanPreview] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Compute collections for the selected date
  const todayReceipts = receipts.filter((r) => r.date === date);
  const systemCash = todayReceipts
    .filter((r) => r.paymentMode === 'BURSAR_CASH_COUNTER')
    .reduce((sum, r) => sum + r.amountPaidNow, 0);

  const posCardTotal = todayReceipts
    .filter((r) => r.paymentMode === 'BURSAR_POS' || r.paymentMode === 'DEBIT_CREDIT_CARD')
    .reduce((sum, r) => sum + r.amountPaidNow, 0);

  const upiTotal = todayReceipts
    .filter((r) => r.paymentMode === 'UPI')
    .reduce((sum, r) => sum + r.amountPaidNow, 0);

  // Physical cash counted calculation
  const physicalCashCounted = DENOMINATIONS.reduce((acc, denom) => {
    const count = denominations[denom.toString()] || 0;
    return acc + denom * count;
  }, 0);

  // Variance: physical counted vs (opening float + system cash)
  const expectedCash = openingFloat + systemCash;
  const variance = physicalCashCounted - expectedCash;

  const handleDenomChange = (denom: number, count: number) => {
    setDenominations((prev) => ({
      ...prev,
      [denom.toString()]: Math.max(0, count || 0),
    }));
  };

  const handleAutoTallyWithSystem = () => {
    // Helper to auto-fill denominations matching system total + opening float
    const target = expectedCash;
    let remaining = target;
    const newDenom: Record<string, number> = {};

    [500, 200, 100, 50, 20, 10].forEach((d) => {
      const c = Math.floor(remaining / d);
      newDenom[d.toString()] = c;
      remaining -= c * d;
    });

    setDenominations(newDenom);
  };

  const handleConfirmSubmit = () => {
    const newClosing: DrawerClosing = {
      id: `DRAWER-${date.replace(/-/g, '')}`,
      date,
      cashierName: currentUser.name,
      openingCash: openingFloat,
      systemCash,
      countedCash: physicalCashCounted,
      posSlipAmount: posCardTotal,
      upiAmount: upiTotal,
      denominations,
      variance,
      depositSlipNumber: `SBI-CHALLAN-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      bankName,
      status: 'SUBMITTED',
      notes,
    };

    onSubmitClosing(newClosing);
    setSubmittedSuccess(true);
    setShowChallanPreview(true);
  };

  const printChallan = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 print:border-none print:shadow-none print:max-h-none print:max-w-none">
        {/* Header - Screen only */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Daily Cashier Drawer Closing & Bank Deposit Slip</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  Bursar Day-End
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Physical denomination tally, cash/POS/UPI reconciliation, and State Bank Challan generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChallanPreview(!showChallanPreview)}
              className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-400/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{showChallanPreview ? 'Back to Tally Sheet' : 'Preview Deposit Challan'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {!showChallanPreview ? (
            <div className="space-y-5">
              {/* Top Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Closing Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cashier in Charge</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.name} (${currentUser.role})`}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Morning Opening Cash Float (₹)</label>
                  <input
                    type="number"
                    value={openingFloat}
                    onChange={(e) => setOpeningFloat(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Collections Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                      System Cash Counter Receipts
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-emerald-950">
                    ₹{systemCash.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    {todayReceipts.filter((r) => r.paymentMode === 'BURSAR_CASH_COUNTER').length} Cash Transactions today
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-blue-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Pine Labs Card POS Batch
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-blue-950">
                    ₹{posCardTotal.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-blue-700">Directly settled to Central Current A/C</div>
                </div>

                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-purple-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-purple-600" />
                      UPI Dynamic QR Collections
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-purple-950">
                    ₹{upiTotal.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-purple-700">Instant UPI VPA Settlement</div>
                </div>
              </div>

              {/* Physical Denominations Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Physical Cash Drawer Denomination Tally Counter</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoTallyWithSystem}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-semibold transition cursor-pointer"
                  >
                    Quick Auto-Fill with Expected Float
                  </button>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[500, 200, 100, 50, 20, 10].map((denom) => {
                    const count = denominations[denom.toString()] || 0;
                    const subtotal = count * denom;
                    return (
                      <div
                        key={denom}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                      >
                        <div className="w-16 font-mono font-bold text-slate-800">₹{denom} ×</div>
                        <input
                          type="number"
                          min={0}
                          value={count}
                          onChange={(e) => handleDenomChange(denom, Number(e.target.value))}
                          className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-center font-mono font-bold"
                        />
                        <div className="font-mono font-semibold text-slate-700 min-w-[70px] text-right">
                          = ₹{subtotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Variance & Tally Bar */}
                <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div>Expected in Drawer: <strong className="font-mono">₹{expectedCash.toLocaleString('en-IN')}</strong> (₹{openingFloat} Float + ₹{systemCash} Cash)</div>
                    <div>Physical Cash Counted: <strong className="font-mono text-sm text-blue-900">₹{physicalCashCounted.toLocaleString('en-IN')}</strong></div>
                  </div>

                  <div className="flex items-center gap-3">
                    {variance === 0 ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Exact Zero Discrepancy Tallied
                      </span>
                    ) : variance > 0 ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        Surplus of +₹{variance.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Shortage of -₹{Math.abs(variance).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Deposit Details & Confirmation */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800">Deposit Challan Configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Target College Institutional Bank Account</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Cashier Handover Notes & POS Verification</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={handleConfirmSubmit}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Day-End Closing & Generate Bank Deposit Slip</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* PRINTABLE BANK DEPOSIT CHALLAN SLIP (SBI / HDFC) */
            <div className="max-w-2xl mx-auto p-6 bg-white border border-slate-300 rounded-xl shadow-sm space-y-5 text-slate-900 print:border-none print:p-0">
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
                    BANK COPY / CHALLAN
                  </span>
                  <div className="font-bold text-sm mt-1">CHALLAN #{`SBI-${date.replace(/-/g, '')}-8901`}</div>
                  <div className="text-slate-500">Date: {date}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Deposit Bank & Branch:</span>
                  <strong className="text-slate-800">{bankName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Account Beneficiary:</span>
                  <strong className="text-slate-800">{COLLEGE_INFO.name} Fee Account</strong>
                </div>
              </div>

              {/* Denomination Breakup Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Currency Denomination Breakup
                </h4>
                <table className="w-full text-xs border border-slate-300">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                    <tr>
                      <th className="p-2 text-left">Denomination</th>
                      <th className="p-2 text-center">Pieces / Count</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {[500, 200, 100, 50, 20, 10].map((denom) => {
                      const count = denominations[denom.toString()] || 0;
                      if (count === 0) return null;
                      return (
                        <tr key={denom}>
                          <td className="p-2 font-bold">₹{denom}</td>
                          <td className="p-2 text-center">{count}</td>
                          <td className="p-2 text-right">₹{(count * denom).toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={2} className="p-2 text-right font-sans">
                        Net Cash Deposited into Bank:
                      </td>
                      <td className="p-2 text-right text-sm">₹{physicalCashCounted.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Additional collections summary */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Card POS Direct Swipes:</span>
                  <span className="font-mono font-bold">₹{posCardTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>UPI Dynamic QR Direct Inward:</span>
                  <span className="font-mono font-bold">₹{upiTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>Total Daily Bursary Inflow:</span>
                  <span className="font-mono">₹{(physicalCashCounted + posCardTotal + upiTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-slate-500 text-[10px]">Senior Bursar / Cashier In-Charge</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-900">Bank Receiving Officer & Seal</div>
                  <div className="text-slate-500 text-[10px]">Branch Cash Counter Stamp</div>
                </div>
              </div>

              <div className="print:hidden pt-4 flex justify-between items-center border-t border-slate-200">
                <button
                  onClick={() => setShowChallanPreview(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Edit Tallies
                </button>
                <button
                  onClick={printChallan}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Bank Challan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Collegiate Banking Clearing & Statutory Reconciliation Protocol</span>
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
