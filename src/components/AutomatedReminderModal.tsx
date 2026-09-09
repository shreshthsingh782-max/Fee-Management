import React, { useState } from 'react';
import { 
  Student, 
  ReminderRule, 
  ReminderTemplate, 
  ReminderLog, 
  UserRole 
} from '../types';
import { COLLEGE_INFO } from '../data/mockData';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Play, 
  Sliders, 
  FileText, 
  Send, 
  Sparkles, 
  Smartphone, 
  Info, 
  UserCheck, 
  History,
  Lock
} from 'lucide-react';

interface AutomatedReminderModalProps {
  students: Student[];
  rules: ReminderRule[];
  templates: ReminderTemplate[];
  logs: ReminderLog[];
  currentUserRole: UserRole;
  onUpdateRules: (rules: ReminderRule[]) => void;
  onUpdateTemplates: (templates: ReminderTemplate[]) => void;
  onSendReminders: (newLogs: ReminderLog[]) => void;
  onClose: () => void;
}

export const AutomatedReminderModal: React.FC<AutomatedReminderModalProps> = ({
  students,
  rules,
  templates,
  logs,
  currentUserRole,
  onUpdateRules,
  onUpdateTemplates,
  onSendReminders,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'RULES' | 'TEMPLATES' | 'SCAN_DISPATCH' | 'LOGS'>('SCAN_DISPATCH');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'TMPL-DUE-7-DAYS');
  const [editedTemplates, setEditedTemplates] = useState<ReminderTemplate[]>(templates);
  const [localRules, setLocalRules] = useState<ReminderRule[]>(rules);
  const [previewMode, setPreviewMode] = useState<'SMS' | 'EMAIL'>('SMS');
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  const canEditData = currentUserRole === 'SUPER_ADMIN';

  // Helper to calculate difference in days between two dates
  const getDaysDifference = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Find students due in exactly or around 7 days (between 5 and 7 days)
  const studentsDue7Days = students.filter((s) => {
    if (s.pendingDue <= 0) return false;
    const diff = getDaysDifference(s.dueDate);
    return diff >= 5 && diff <= 7;
  });

  // Find students overdue by 3 days (due 3 days ago or overdue between -3 and -5 days)
  const studentsOverdue3Days = students.filter((s) => {
    if (s.pendingDue <= 0) return false;
    const diff = getDaysDifference(s.dueDate);
    return diff <= -3 && diff >= -6;
  });

  const activeTemplate = editedTemplates.find((t) => t.id === selectedTemplateId) || editedTemplates[0];

  // Helper to substitute template placeholders for preview
  const generatePreviewContent = (template: ReminderTemplate, student: Student, type: 'EMAIL_SUBJECT' | 'EMAIL_BODY' | 'SMS') => {
    const map: Record<string, string> = {
      '{student_name}': student.name,
      '{parent_name}': student.parentName,
      '{roll_no}': student.rollNo,
      '{degree_program}': student.degreeProgram,
      '{department}': student.department,
      '{pending_amount}': student.pendingDue.toLocaleString('en-IN'),
      '{due_date}': student.dueDate,
      '{college_name}': COLLEGE_INFO.name,
      '{payment_link}': `https://portal.smdc.edu.in/pay/${student.rollNo}`,
    };

    let text = '';
    if (type === 'EMAIL_SUBJECT') text = template.emailSubject;
    else if (type === 'EMAIL_BODY') text = template.emailBody;
    else text = template.smsMessage;

    Object.entries(map).forEach(([key, val]) => {
      text = text.replaceAll(key, val);
    });

    return text;
  };

  const sampleStudent: Student = studentsDue7Days[0] || students[1] || students[0] || {
    id: 'STU-SAMPLE',
    name: 'Aarav Sharma',
    rollNo: '23BCSE104',
    degreeProgram: 'B.Tech Computer Science',
    department: 'Computer Science & Engineering',
    semester: 4,
    academicYear: '2025-2026',
    totalFee: 85000,
    paidAmount: 50000,
    pendingDue: 35000,
    dueDate: '2026-03-31',
    category: 'GENERAL',
    status: 'PENDING',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@smdc.edu.in',
    parentName: 'Rajesh Sharma',
    parentPhone: '+91 98765 43211',
    parentEmail: 'rajesh.sharma@example.com',
    concessions: [],
    installments: [],
    paymentHistory: [],
    qrToken: 'QR-SAMPLE',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  };

  const handleTemplateChange = (field: 'emailSubject' | 'emailBody' | 'smsMessage', value: string) => {
    if (!canEditData) return;
    setEditedTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplateId ? { ...t, [field]: value, lastUpdated: new Date().toLocaleString('en-IN') } : t
      )
    );
  };

  const handleSaveTemplateChanges = () => {
    if (!canEditData) return;
    onUpdateTemplates(editedTemplates);
    setDispatchSuccessMsg('Reminder template configuration updated successfully.');
    setTimeout(() => setDispatchSuccessMsg(null), 3500);
  };

  const handleRuleToggle = (ruleId: string) => {
    if (!canEditData) return;
    const updated = localRules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    setLocalRules(updated);
    onUpdateRules(updated);
  };

  const handleChannelChange = (ruleId: string, channel: 'EMAIL' | 'SMS' | 'BOTH') => {
    if (!canEditData) return;
    const updated = localRules.map((r) => (r.id === ruleId ? { ...r, channel } : r));
    setLocalRules(updated);
    onUpdateRules(updated);
  };

  // Automated dispatch execution
  const handleExecuteAutomatedDispatch = () => {
    const newLogs: ReminderLog[] = [];
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

    // 1. Process Due in 7 Days rule
    const rule7 = localRules.find((r) => r.triggerType === 'DUE_IN_7_DAYS');
    const tmpl7 = editedTemplates.find((t) => t.triggerType === 'DUE_IN_7_DAYS') || editedTemplates[0];

    if (rule7 && rule7.enabled) {
      studentsDue7Days.forEach((stu) => {
        if (rule7.channel === 'EMAIL' || rule7.channel === 'BOTH') {
          newLogs.push({
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp,
            studentId: stu.id,
            studentRollNo: stu.rollNo,
            studentName: stu.name,
            parentName: stu.parentName,
            recipientEmail: `${stu.email} / ${stu.parentEmail}`,
            recipientPhone: stu.phone,
            triggerType: 'DUE_IN_7_DAYS',
            channel: 'EMAIL',
            subjectOrPreview: generatePreviewContent(tmpl7, stu, 'EMAIL_SUBJECT'),
            messageContent: generatePreviewContent(tmpl7, stu, 'EMAIL_BODY'),
            amountDue: stu.pendingDue,
            dueDate: stu.dueDate,
            status: 'DELIVERED',
            deliveryMode: 'AUTOMATED_CRON',
          });
        }
        if (rule7.channel === 'SMS' || rule7.channel === 'BOTH') {
          newLogs.push({
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000) + 1}`,
            timestamp,
            studentId: stu.id,
            studentRollNo: stu.rollNo,
            studentName: stu.name,
            parentName: stu.parentName,
            recipientEmail: stu.email,
            recipientPhone: `${stu.phone} & Parent: ${stu.parentPhone}`,
            triggerType: 'DUE_IN_7_DAYS',
            channel: 'SMS',
            subjectOrPreview: generatePreviewContent(tmpl7, stu, 'SMS').slice(0, 70) + '...',
            messageContent: generatePreviewContent(tmpl7, stu, 'SMS'),
            amountDue: stu.pendingDue,
            dueDate: stu.dueDate,
            status: 'DELIVERED',
            deliveryMode: 'AUTOMATED_CRON',
          });
        }
      });
    }

    // 2. Process Overdue by 3 Days rule
    const rule3 = localRules.find((r) => r.triggerType === 'OVERDUE_BY_3_DAYS');
    const tmpl3 = editedTemplates.find((t) => t.triggerType === 'OVERDUE_BY_3_DAYS') || editedTemplates[1] || editedTemplates[0];

    if (rule3 && rule3.enabled) {
      studentsOverdue3Days.forEach((stu) => {
        if (rule3.channel === 'EMAIL' || rule3.channel === 'BOTH') {
          newLogs.push({
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000) + 2}`,
            timestamp,
            studentId: stu.id,
            studentRollNo: stu.rollNo,
            studentName: stu.name,
            parentName: stu.parentName,
            recipientEmail: `${stu.email} / ${stu.parentEmail}`,
            recipientPhone: stu.phone,
            triggerType: 'OVERDUE_BY_3_DAYS',
            channel: 'EMAIL',
            subjectOrPreview: generatePreviewContent(tmpl3, stu, 'EMAIL_SUBJECT'),
            messageContent: generatePreviewContent(tmpl3, stu, 'EMAIL_BODY'),
            amountDue: stu.pendingDue,
            dueDate: stu.dueDate,
            status: 'DELIVERED',
            deliveryMode: 'AUTOMATED_CRON',
          });
        }
        if (rule3.channel === 'SMS' || rule3.channel === 'BOTH') {
          newLogs.push({
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000) + 3}`,
            timestamp,
            studentId: stu.id,
            studentRollNo: stu.rollNo,
            studentName: stu.name,
            parentName: stu.parentName,
            recipientEmail: stu.email,
            recipientPhone: `${stu.phone} & Parent: ${stu.parentPhone}`,
            triggerType: 'OVERDUE_BY_3_DAYS',
            channel: 'SMS',
            subjectOrPreview: generatePreviewContent(tmpl3, stu, 'SMS').slice(0, 70) + '...',
            messageContent: generatePreviewContent(tmpl3, stu, 'SMS'),
            amountDue: stu.pendingDue,
            dueDate: stu.dueDate,
            status: 'DELIVERED',
            deliveryMode: 'AUTOMATED_CRON',
          });
        }
      });
    }

    if (newLogs.length > 0) {
      onSendReminders(newLogs);
      setDispatchSuccessMsg(`Automated Dispatch Succeeded: ${newLogs.length} notifications dispatched via SMS and Email gateways.`);
      setActiveTab('LOGS');
    } else {
      setDispatchSuccessMsg('No pending candidates matched active rules at this moment.');
    }

    setTimeout(() => setDispatchSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl my-3 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/30 text-blue-400 rounded border border-blue-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white">Automated Payment Reminder System</h3>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-mono">
                  AUTOMATION ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Auto-dispatches SMS & Email to Students & Parents for Fees Due in 7 Days & Overdue by 3 Days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Permission Banner if not Super Admin */}
        {!canEditData && (
          <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>
                <strong>Read-Only Monitoring:</strong> You are logged in as <strong>{currentUserRole.replace('_', ' ')}</strong>. Only <strong>SUPER ADMIN</strong> can make modifications to automated rules and reminder messages.
              </span>
            </div>
          </div>
        )}

        {/* Success Alert Banner */}
        {dispatchSuccessMsg && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{dispatchSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('SCAN_DISPATCH')}
            className={`px-3 py-1.5 font-bold rounded-t-lg transition border-t border-x cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SCAN_DISPATCH'
                ? 'bg-white text-blue-900 border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-blue-600" />
            <span>Rule Evaluation & Dispatch</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px] font-mono font-bold">
              {studentsDue7Days.length + studentsOverdue3Days.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 font-bold rounded-t-lg transition border-t border-x cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RULES'
                ? 'bg-white text-blue-900 border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Schedule Rules (7-Day & 3-Day)</span>
          </button>

          <button
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-3 py-1.5 font-bold rounded-t-lg transition border-t border-x cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TEMPLATES'
                ? 'bg-white text-blue-900 border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Customizable Message Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1.5 font-bold rounded-t-lg transition border-t border-x cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'LOGS'
                ? 'bg-white text-blue-900 border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Dispatch Audit Log</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-mono">
              {logs.length}
            </span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-[75vh]">
          {/* TAB 1: SCAN & DISPATCH ENGINE */}
          {activeTab === 'SCAN_DISPATCH' && (
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Automated Evaluation Engine: Live Matched Candidates
                  </h4>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Evaluates student fees against the 7-day upcoming and 3-day overdue rules to trigger instant multi-channel reminders to students and parents.
                  </p>
                </div>
                <button
                  onClick={handleExecuteAutomatedDispatch}
                  className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Automated Dispatch Now</span>
                </button>
              </div>

              {/* Matched Groups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Group 1: Fees Due in 7 Days */}
                <div className="border border-blue-200 rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-100 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-700" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">1. Fees Due in 7 Days</h5>
                        <p className="text-[10px] text-slate-500">Target: Student & Parent SMS/Email</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-mono font-bold text-xs">
                      {studentsDue7Days.length} Eligible
                    </span>
                  </div>

                  {studentsDue7Days.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No students with fees due in 7 days.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {studentsDue7Days.map((stu) => (
                        <div key={stu.id} className="p-2.5 bg-blue-50/50 border border-blue-100 rounded text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-900">{stu.name}</span>
                              <span className="font-mono text-[10px] text-blue-700 ml-1.5">({stu.rollNo})</span>
                              <div className="text-[11px] text-slate-600">{stu.degreeProgram}</div>
                            </div>
                            <span className="font-mono font-bold text-blue-900">
                              ₹{stu.pendingDue.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="mt-1.5 pt-1.5 border-t border-blue-100/80 text-[10px] grid grid-cols-2 gap-1 text-slate-500">
                            <div>
                              <span className="font-medium text-slate-700">Due Date:</span> {stu.dueDate} (in 7 days)
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Parent:</span> {stu.parentName}
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-slate-700">SMS:</span> {stu.phone}
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-slate-700">Parent Phone:</span> {stu.parentPhone}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Group 2: Fees Overdue by 3 Days */}
                <div className="border border-rose-200 rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-100 mb-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-700" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">2. Fees Overdue by 3 Days</h5>
                        <p className="text-[10px] text-rose-600">Action: Urgent Hall Ticket Warning Link</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-900 rounded font-mono font-bold text-xs">
                      {studentsOverdue3Days.length} Eligible
                    </span>
                  </div>

                  {studentsOverdue3Days.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No students overdue by 3 days.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {studentsOverdue3Days.map((stu) => (
                        <div key={stu.id} className="p-2.5 bg-rose-50/50 border border-rose-100 rounded text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-900">{stu.name}</span>
                              <span className="font-mono text-[10px] text-rose-700 ml-1.5">({stu.rollNo})</span>
                              <div className="text-[11px] text-slate-600">{stu.degreeProgram}</div>
                            </div>
                            <span className="font-mono font-bold text-rose-900">
                              ₹{stu.pendingDue.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="mt-1.5 pt-1.5 border-t border-rose-100/80 text-[10px] grid grid-cols-2 gap-1 text-slate-500">
                            <div>
                              <span className="font-medium text-rose-800 font-semibold">Overdue:</span> {stu.dueDate} (3 days ago)
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Parent:</span> {stu.parentName}
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-slate-700">SMS:</span> {stu.phone}
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-slate-700">Parent Phone:</span> {stu.parentPhone}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUTOMATION RULES */}
          {activeTab === 'RULES' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 mb-2">
                Configure triggering schedules and channels. Changes require Super Admin privileges.
              </div>

              {localRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3.5 border rounded-lg transition ${
                    rule.enabled ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{rule.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rule.daysOffset > 0 ? 'bg-blue-100 text-blue-900' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {rule.daysOffset > 0 ? `T-${rule.daysOffset} Days (Pre-Due)` : `T+${Math.abs(rule.daysOffset)} Days (Overdue)`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{rule.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          disabled={!canEditData}
                          onChange={() => handleRuleToggle(rule.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-[11px]">{rule.enabled ? 'Active Rule' : 'Disabled'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Channel Configuration */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Dispatch Channel
                      </label>
                      <div className="flex gap-2">
                        {(['BOTH', 'SMS', 'EMAIL'] as const).map((ch) => (
                          <button
                            key={ch}
                            type="button"
                            disabled={!canEditData}
                            onClick={() => handleChannelChange(rule.id, ch)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                              rule.channel === ch
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            } ${!canEditData ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          >
                            {ch === 'BOTH' ? 'SMS & Email' : ch}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Recipients Intimated
                      </label>
                      <div className="flex items-center gap-3 text-[11px] text-slate-700">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Student (Email & SMS)
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Parent / Guardian (Email & SMS)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CUSTOMIZABLE TEMPLATES */}
          {activeTab === 'TEMPLATES' && (
            <div className="space-y-3">
              {/* Template Selector */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {editedTemplates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${
                        selectedTemplateId === tmpl.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {tmpl.triggerType === 'DUE_IN_7_DAYS' ? '7-Day Due Reminder' : '3-Day Overdue Warning'}
                    </button>
                  ))}
                </div>

                {canEditData && (
                  <button
                    onClick={handleSaveTemplateChanges}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs cursor-pointer shadow-xs transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Template Changes</span>
                  </button>
                )}
              </div>

              {/* Dynamic Variables Pill Bar */}
              <div className="p-2 bg-slate-100 rounded border border-slate-200 text-[10px] space-y-1">
                <span className="font-bold text-slate-700">Available Customizable Placeholders:</span>
                <div className="flex flex-wrap gap-1 mt-1 font-mono text-slate-800">
                  {['{student_name}', '{parent_name}', '{roll_no}', '{due_date}', '{pending_amount}', '{degree_program}', '{college_name}', '{payment_link}'].map((v) => (
                    <span key={v} className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-blue-900">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Editor + Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Left: Editor */}
                <div className="space-y-3 border border-slate-200 rounded-lg p-3 bg-white">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email Subject Line
                    </label>
                    <input
                      type="text"
                      value={activeTemplate.emailSubject}
                      disabled={!canEditData}
                      onChange={(e) => handleTemplateChange('emailSubject', e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email Body Content
                    </label>
                    <textarea
                      rows={6}
                      value={activeTemplate.emailBody}
                      disabled={!canEditData}
                      onChange={(e) => handleTemplateChange('emailBody', e.target.value)}
                      className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 leading-relaxed"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        SMS Message Text (160 char limit per segment)
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">
                        {activeTemplate.smsMessage.length} chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={activeTemplate.smsMessage}
                      disabled={!canEditData}
                      onChange={(e) => handleTemplateChange('smsMessage', e.target.value)}
                      className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* Right: Live Simulated Preview */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Live Output Preview ({sampleStudent.name})
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPreviewMode('SMS')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          previewMode === 'SMS' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        SMS Preview
                      </button>
                      <button
                        onClick={() => setPreviewMode('EMAIL')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          previewMode === 'EMAIL' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Email Letterhead
                      </button>
                    </div>
                  </div>

                  {previewMode === 'SMS' ? (
                    <div className="p-3 bg-slate-900 rounded-lg text-white font-sans text-xs space-y-2 max-w-sm mx-auto shadow-inner">
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800">
                        <span>Sender: VM-SMDC-COL</span>
                        <span>SIM 1 • +91</span>
                      </div>
                      <div className="bg-blue-600/90 p-2.5 rounded-lg text-white leading-relaxed text-[11px]">
                        {generatePreviewContent(activeTemplate, sampleStudent, 'SMS')}
                      </div>
                      <div className="text-[9px] text-slate-500 text-right">
                        Delivered via NIC / Bharat Telecom SMS Gateway
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white border border-slate-300 rounded shadow-xs text-xs space-y-2 text-slate-800 leading-relaxed font-sans">
                      <div className="border-b border-slate-200 pb-1.5 text-[10px] text-slate-500">
                        <div><strong>From:</strong> {COLLEGE_INFO.bursarEmail}</div>
                        <div><strong>To:</strong> {sampleStudent.email}, {sampleStudent.parentEmail}</div>
                        <div><strong>Subject:</strong> {generatePreviewContent(activeTemplate, sampleStudent, 'EMAIL_SUBJECT')}</div>
                      </div>
                      <div className="whitespace-pre-line text-[11px] text-slate-700">
                        {generatePreviewContent(activeTemplate, sampleStudent, 'EMAIL_BODY')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DISPATCH AUDIT LOGS */}
          {activeTab === 'LOGS' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Total Dispatched Records: <strong>{logs.length}</strong></span>
                <span className="font-mono text-[10px]">NAAC Audit Trail & Compliance Log</span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2 px-3">Timestamp</th>
                      <th className="py-2 px-3">Student & Roll No</th>
                      <th className="py-2 px-3">Rule Type</th>
                      <th className="py-2 px-3">Channel</th>
                      <th className="py-2 px-3">Recipient Details</th>
                      <th className="py-2 px-3">Due Amount</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-900 block">{log.studentName}</span>
                          <span className="font-mono text-[10px] text-blue-700">{log.studentRollNo}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            log.triggerType === 'DUE_IN_7_DAYS' ? 'bg-blue-100 text-blue-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {log.triggerType === 'DUE_IN_7_DAYS' ? 'Due in 7 Days' : 'Overdue by 3 Days'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-mono text-[10px] font-semibold text-slate-700">
                            {log.channel}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[10px] text-slate-600 max-w-xs truncate">
                          {log.channel === 'EMAIL' ? log.recipientEmail : log.recipientPhone}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          ₹{log.amountDue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500">
            {COLLEGE_INFO.name} • Automated Fee Notice Gateway
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
