import React, { useState } from 'react';
import { Student } from '../types';
import { COLLEGE_INFO } from '../data/mockData';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Building2, 
  FileText,
  Clock
} from 'lucide-react';

interface DefaultersNoticeModalProps {
  overdueStudents: Student[];
  onClose: () => void;
}

export const DefaultersNoticeModal: React.FC<DefaultersNoticeModalProps> = ({
  overdueStudents,
  onClose,
}) => {
  const [noticeStage, setNoticeStage] = useState<'REMINDER_1' | 'URGENT_2' | 'FINAL_EXAM'>('URGENT_2');
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    overdueStudents.map((s) => s.id)
  );

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSendNotices = () => {
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
  };

  const sampleStudent = overdueStudents[0] || {
    name: 'Rohan Deshmukh',
    rollNo: '23BME089',
    pendingDue: 82000,
    dueDate: '2026-02-10',
    degreeProgram: 'B.Tech Mechanical',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-rose-200 bg-rose-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 text-rose-800 rounded">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-950">Automated Defaulters Fee Reminder Dispatch</h3>
              <p className="text-[10px] text-rose-700">Official Collegiate Notices with Instant Payment Links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto max-h-[82vh]">
          {/* Notice Stage Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Institutional Notice Escalation Level
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setNoticeStage('REMINDER_1')}
                className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer text-xs ${
                  noticeStage === 'REMINDER_1'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                1st Courtesy Notice
              </button>
              <button
                type="button"
                onClick={() => setNoticeStage('URGENT_2')}
                className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer text-xs ${
                  noticeStage === 'URGENT_2'
                    ? 'border-amber-600 bg-amber-50/70 text-amber-900 ring-1 ring-amber-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                2nd Urgent Warning
              </button>
              <button
                type="button"
                onClick={() => setNoticeStage('FINAL_EXAM')}
                className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer text-xs ${
                  noticeStage === 'FINAL_EXAM'
                    ? 'border-rose-600 bg-rose-50/70 text-rose-900 ring-1 ring-rose-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Final Call (Hall Ticket)
              </button>
            </div>
          </div>

          {/* Letterhead Preview */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-500" />
              <span>Official Notice Letterhead Preview</span>
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 font-sans leading-relaxed text-slate-800">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 text-[11px]">
                <span className="font-bold text-slate-900">{COLLEGE_INFO.name} • Office of the Bursar</span>
                <span className="font-mono text-slate-500">Ref: BUR/NOT/2026/048</span>
              </div>
              <p className="font-bold text-xs">
                Subject: {noticeStage === 'FINAL_EXAM' ? 'FINAL NOTICE: Semester Examination Clearance & Outstanding Dues' : 'Reminder: Outstanding Semester Fee Clearance'}
              </p>
              <p className="text-[11px]">
                Dear <span className="font-bold">{sampleStudent.name}</span> (Roll No: <span className="font-mono font-bold">{sampleStudent.rollNo}</span>),
              </p>
              <p className="text-slate-600 text-[11px]">
                According to the collegiate bursar records for Academic Year 2025-2026, an outstanding semester fee balance of <span className="font-bold text-rose-800 font-mono">₹{sampleStudent.pendingDue.toLocaleString('en-IN')}</span> remains unpaid. The due date was <span className="font-semibold text-slate-800">{sampleStudent.dueDate}</span>.
              </p>
              {noticeStage === 'FINAL_EXAM' && (
                <p className="p-1.5 bg-rose-100 text-rose-900 rounded font-semibold text-[10px]">
                  WARNING: Failure to remit outstanding dues within 48 hours will result in provisional suspension of the semester end hall ticket and library access.
                </p>
              )}
              <div className="pt-1.5 flex items-center justify-between text-[10px] border-t border-slate-200">
                <span className="text-blue-800 font-semibold underline">
                  Instant Payment URL: https://portal.apexdegree.edu/pay/{sampleStudent.rollNo}
                </span>
                <span className="font-semibold text-slate-700">Controller of Accounts</span>
              </div>
            </div>
          </div>

          {/* Student Recipient Checklist */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Target Recipients ({selectedStudents.length} Selected)
              </label>
              <button
                type="button"
                onClick={() => setSelectedStudents(overdueStudents.map((s) => s.id))}
                className="text-[10px] text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                Select All
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
              {overdueStudents.map((stu) => (
                <div
                  key={stu.id}
                  onClick={() => toggleStudent(stu.id)}
                  className="p-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(stu.id)}
                      onChange={() => {}}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900">{stu.name}</span>
                      <span className="text-slate-500 font-mono text-[10px] ml-1">({stu.rollNo})</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-rose-700 text-xs">
                    ₹{stu.pendingDue.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendNotices}
              disabled={selectedStudents.length === 0 || sentSuccess}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {sentSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Notices Dispatched Successfully!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Notices to {selectedStudents.length} Students</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
