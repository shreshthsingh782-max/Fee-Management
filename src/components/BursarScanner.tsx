import React, { useState, useEffect, useRef } from 'react';
import { Student, PaymentMode, Receipt, PaymentRecord } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  Camera, 
  QrCode, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  CreditCard, 
  Banknote, 
  ArrowRight, 
  History, 
  Search, 
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface BursarScannerProps {
  students: Student[];
  selectedStudent?: Student | null;
  onPaymentSuccess: (updatedStudent: Student, newReceipt: Receipt) => void;
  onViewReceipt: (receipt: Receipt) => void;
  onSelectStudent: (student: Student) => void;
}

export const BursarScanner: React.FC<BursarScannerProps> = ({
  students,
  selectedStudent,
  onPaymentSuccess,
  onViewReceipt,
  onSelectStudent,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [manualQuery, setManualQuery] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('BURSAR_CASH_COUNTER');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [cashierReference, setCashierReference] = useState<string>('');
  const [counterTerminal, setCounterTerminal] = useState<string>('Counter #03 (Main Campus Bursar)');
  const [recentScans, setRecentScans] = useState<Array<{ student: Student; time: string; action: string }>>([]);
  const [isScanningAnimation, setIsScanningAnimation] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize with selectedStudent or the first student having dues for immediate demo readiness
  useEffect(() => {
    if (selectedStudent) {
      handleSelectScannedStudent(selectedStudent);
    } else {
      const studentWithDue = students.find((s) => s.pendingDue > 0) || students[0];
      if (studentWithDue && !scannedStudent) {
        handleSelectScannedStudent(studentWithDue);
      }
    }
  }, [selectedStudent, students]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Camera API is not supported in this browser context.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Unable to access camera (permission denied or running in sandboxed environment). Use the Instant Test Scanner below.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleSelectScannedStudent = (student: Student) => {
    setIsScanningAnimation(true);
    setTimeout(() => {
      setScannedStudent(student);
      setPaymentAmount(student.pendingDue > 0 ? student.pendingDue : 0);
      setCashierReference(`CTR-CSH-${Math.floor(10000 + Math.random() * 90000)}`);
      setIsScanningAnimation(false);

      // Add to recent scans log
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setRecentScans((prev) => [
        { student, time: timeStr, action: student.pendingDue > 0 ? 'Dues Identified' : 'Already Cleared' },
        ...prev.slice(0, 7),
      ]);
    }, 400);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    const found = students.find(
      (s) =>
        s.rollNo.toLowerCase().includes(manualQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(manualQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(manualQuery.toLowerCase())
    );
    if (found) {
      handleSelectScannedStudent(found);
      setManualQuery('');
    } else {
      alert(`No student found matching "${manualQuery}"`);
    }
  };

  const handleProcessCounterPayment = () => {
    if (!scannedStudent) return;
    if (paymentAmount <= 0) {
      alert('Please enter an amount greater than zero.');
      return;
    }

    const timestamp = Date.now();
    const receiptNumber = `REC-2026-BUR-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    const newPaidAmount = scannedStudent.paidAmount + paymentAmount;
    const newPendingDue = Math.max(0, scannedStudent.totalFee - newPaidAmount);
    const newStatus = newPendingDue === 0 ? 'CLEARED' : 'PARTIAL';

    const newPaymentRecord: PaymentRecord = {
      id: `PAY-BUR-${timestamp}`,
      studentId: scannedStudent.id,
      receiptNumber,
      amount: paymentAmount,
      date: today,
      paymentMode,
      bankName:
        paymentMode === 'BURSAR_CASH_COUNTER'
          ? 'Bursar Counter Cash Office'
          : paymentMode === 'BURSAR_POS'
          ? 'Bursar Card POS Terminal #03'
          : 'Bursar Counter Desk',
      transactionRef: cashierReference || `BUR-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'SUCCESS',
      remarks: `Paid at ${counterTerminal} by student in person`,
    };

    const updatedStudent: Student = {
      ...scannedStudent,
      paidAmount: newPaidAmount,
      pendingDue: newPendingDue,
      status: newStatus,
      paymentHistory: [newPaymentRecord, ...scannedStudent.paymentHistory],
      qrToken: `AUTH_STU_${scannedStudent.rollNo}_${newPendingDue}_${newStatus}_METRO2026`,
    };

    const newReceipt: Receipt = {
      receiptNumber,
      date: today,
      studentId: scannedStudent.id,
      rollNo: scannedStudent.rollNo,
      studentName: scannedStudent.name,
      degreeProgram: scannedStudent.degreeProgram,
      department: scannedStudent.department,
      semester: scannedStudent.semester,
      academicYear: scannedStudent.academicYear,
      items: scannedStudent.feeItems,
      subtotal: scannedStudent.totalFee,
      scholarshipDiscount: scannedStudent.scholarshipQuota?.includes('Waiver') ? 10000 : 0,
      lateFee: 0,
      totalAmount: scannedStudent.totalFee,
      amountPaidNow: paymentAmount,
      balanceRemaining: newPendingDue,
      paymentMode,
      transactionRef: newPaymentRecord.transactionRef,
      bankName: newPaymentRecord.bankName,
      authorizedBy: 'M. P. Sharma (Bursar Counter Lead & Senior Cashier)',
      digitalSealVerified: true,
      status: 'PAID',
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch {
      // Safe fallback
    }

    setScannedStudent(updatedStudent);
    onPaymentSuccess(updatedStudent, newReceipt);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 border border-blue-400/30 rounded-lg text-blue-300">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded">
                  Cashier & Bursar Station
                </span>
                <span className="text-[11px] text-slate-300">Active Terminal: {counterTerminal}</span>
              </div>
              <h2 className="text-base font-bold tracking-tight text-white mt-0.5">
                Student QR Rapid Counter Scanner
              </h2>
              <p className="text-[11px] text-slate-300 max-w-xl">
                Scan unique student QR code generated on student ID cards or the college mobile app for instant verification and counter fee clearance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer w-full md:w-auto justify-center"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Camera Scanner</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer w-full md:w-auto justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Stop Camera</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner Left / Result & Checkout Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Camera / QR Simulator Station (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Active Camera View / Viewfinder */}
          {isCameraActive && (
            <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 shadow-md text-white">
              <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
                {/* Visual Target Reticle */}
                <div className="absolute inset-0 border border-emerald-500/60 pointer-events-none flex items-center justify-center m-6 rounded-lg">
                  <div className="w-36 h-36 border border-emerald-400 rounded relative">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400"></div>
                    <div className="w-full h-0.5 bg-emerald-400/80 absolute top-1/2 -translate-y-1/2 animate-[bounce_1.5s_infinite]"></div>
                  </div>
                </div>
              </div>
              {cameraError && (
                <div className="mt-2 p-2 bg-amber-950/80 border border-amber-800 text-amber-200 text-[11px] rounded flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>{cameraError}</span>
                </div>
              )}
              <div className="mt-1.5 text-center text-[11px] text-slate-400">
                Align the student's QR code within the frame for automatic detection.
              </div>
            </div>
          )}

          {/* Rapid Test Scanner Selector */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Instant One-Click QR Scanner Bar
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Counter Test Feed
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Click any student below to simulate an instant laser scan of their unique collegiate QR code:
            </p>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
              {students.map((student) => {
                const isSelected = scannedStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectScannedStudent(student)}
                    className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{student.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          #{student.rollNo} • {student.degreeProgram.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          student.status === 'CLEARED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : student.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {student.pendingDue === 0 ? 'Cleared' : `Due: ₹${student.pendingDue.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Manual Roll Number Search Form */}
            <form onSubmit={handleManualSearch} className="pt-2 border-t border-slate-100">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Or Enter Student Roll No / ID Manually
              </label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder="e.g. 23BCSE104 or Aarav"
                    className="w-full pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Lookup
                </button>
              </div>
            </form>
          </div>

          {/* Recent Scans Strip */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Today's Counter Activity Log</span>
            </h4>
            {recentScans.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No counter scans recorded yet in this session.</p>
            ) : (
              <div className="space-y-1">
                {recentScans.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <span className="font-semibold text-slate-800 text-[11px]">{item.student.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {item.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scanned Student Dossier & Cashier Counter Settlement (7 cols) */}
        <div className="lg:col-span-7">
          {scannedStudent ? (
            <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-300 ${isScanningAnimation ? 'opacity-50 scale-[0.99]' : 'opacity-100'}`}>
              {/* Verified Identity Header */}
              <div className="bg-slate-900 text-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={scannedStudent.avatarUrl}
                      alt={scannedStudent.name}
                      className="w-12 h-12 rounded-lg object-cover border border-blue-400 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold font-mono bg-blue-600/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/30">
                          #{scannedStudent.rollNo}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Authenticated Student
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-0.5">{scannedStudent.name}</h3>
                      <p className="text-[11px] text-slate-300">
                        {scannedStudent.degreeProgram} • Sem {scannedStudent.semester} ({scannedStudent.academicYear})
                      </p>
                    </div>
                  </div>

                  {/* High-Res Verified QR Display */}
                  <div className="bg-white p-1.5 rounded-lg shadow-xs shrink-0 self-start sm:self-center">
                    <QRCodeSVG value={scannedStudent.qrToken} size={56} level="H" />
                    <span className="block text-[8px] font-mono text-center text-slate-600 font-bold mt-0.5">
                      VERIFIED QR
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee Ledger Snapshot & Status Cards */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 block">Total Assessed</span>
                    <span className="text-sm font-mono font-bold text-slate-900">
                      ₹{scannedStudent.totalFee.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-[10px] font-semibold text-emerald-700 block">Total Paid So Far</span>
                    <span className="text-sm font-mono font-bold text-emerald-900">
                      ₹{scannedStudent.paidAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${
                    scannedStudent.pendingDue > 0 ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <span className={`text-[10px] font-semibold block ${
                      scannedStudent.pendingDue > 0 ? 'text-rose-700' : 'text-blue-700'
                    }`}>
                      Current Outstanding
                    </span>
                    <span className={`text-sm font-mono font-bold ${
                      scannedStudent.pendingDue > 0 ? 'text-rose-800' : 'text-blue-900'
                    }`}>
                      ₹{scannedStudent.pendingDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Breakdown of this student's fee items */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Current Semester Fee Schedule
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <div className="divide-y divide-slate-100">
                      {scannedStudent.feeItems.map((item) => (
                        <div key={item.id} className="p-2 flex justify-between items-center bg-white hover:bg-slate-50">
                          <div>
                            <span className="font-semibold text-slate-800 text-[11px]">{item.category}</span>
                            <span className="text-slate-500 text-[10px] block">{item.description}</span>
                          </div>
                          <span className="font-mono font-semibold text-slate-900 text-xs">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cashier Payment Processing Form */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-blue-700" />
                      <span>Counter Payment Processing</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-600">
                      Terminal: <span className="text-slate-900 font-mono font-bold">Bursar-03</span>
                    </span>
                  </div>

                  {scannedStudent.pendingDue > 0 ? (
                    <div className="space-y-3">
                      {/* Payment Mode Selection */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Received Payment Method
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMode('BURSAR_CASH_COUNTER')}
                            className={`p-2 rounded-lg border text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
                              paymentMode === 'BURSAR_CASH_COUNTER'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Cash Desk</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMode('BURSAR_POS')}
                            className={`p-2 rounded-lg border text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
                              paymentMode === 'BURSAR_POS'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Card POS</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMode('UPI')}
                            className={`p-2 rounded-lg border text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
                              paymentMode === 'UPI'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Counter UPI</span>
                          </button>
                        </div>
                      </div>

                      {/* Payment Amount & Reference */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Amount Collected (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              min={1}
                              max={scannedStudent.pendingDue}
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(Number(e.target.value))}
                              className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                          <div className="flex gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => setPaymentAmount(scannedStudent.pendingDue)}
                              className="text-[10px] text-blue-700 hover:underline font-semibold cursor-pointer"
                            >
                              Pay Full Due (₹{scannedStudent.pendingDue.toLocaleString('en-IN')})
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentAmount(Math.round(scannedStudent.pendingDue / 2))}
                              className="text-[10px] text-slate-600 hover:underline cursor-pointer"
                            >
                              50% Installment
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Counter Receipt Reference / Slip No
                          </label>
                          <input
                            type="text"
                            value={cashierReference}
                            onChange={(e) => setCashierReference(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                            placeholder="CTR-CSH-XXXXX"
                          />
                          <p className="text-[10px] text-slate-500 mt-0.5">Auto-generated internal cashier voucher ref.</p>
                        </div>
                      </div>

                      {/* Process Button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleProcessCounterPayment}
                          className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold tracking-wide uppercase shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Record Counter Payment & Issue Automated Voucher</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-100/60 text-emerald-900 rounded-xl border border-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        <div>
                          <div className="font-bold text-xs">All Semester Dues Cleared</div>
                          <div className="text-[11px] text-emerald-800">
                            Student has 0 pending fee balance for the academic year.
                          </div>
                        </div>
                      </div>
                      {scannedStudent.paymentHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            // Find latest receipt or create temporary for preview
                            const latestPayment = scannedStudent.paymentHistory[0];
                            const rec: Receipt = {
                              receiptNumber: latestPayment.receiptNumber,
                              date: latestPayment.date,
                              studentId: scannedStudent.id,
                              rollNo: scannedStudent.rollNo,
                              studentName: scannedStudent.name,
                              degreeProgram: scannedStudent.degreeProgram,
                              department: scannedStudent.department,
                              semester: scannedStudent.semester,
                              academicYear: scannedStudent.academicYear,
                              items: scannedStudent.feeItems,
                              subtotal: scannedStudent.totalFee,
                              scholarshipDiscount: 0,
                              lateFee: 0,
                              totalAmount: scannedStudent.totalFee,
                              amountPaidNow: latestPayment.amount,
                              balanceRemaining: 0,
                              paymentMode: latestPayment.paymentMode,
                              transactionRef: latestPayment.transactionRef,
                              bankName: latestPayment.bankName,
                              authorizedBy: 'Bursar Counter Archive',
                              digitalSealVerified: true,
                              status: 'RECONCILED',
                            };
                            onViewReceipt(rec);
                          }}
                          className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-emerald-900"
                        >
                          View Past Receipt
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Scan className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No Student QR Code Scanned</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Scan student ID using the camera or select a student from the test scanner list on the left to review fee dues.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
