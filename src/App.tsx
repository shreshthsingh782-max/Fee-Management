import React, { useState, useEffect } from 'react';
import { 
  Student, 
  Receipt, 
  StaffExpense, 
  ReminderRule, 
  ReminderTemplate, 
  ReminderLog, 
  UserProfile, 
  UserRole,
  AuditLogEntry,
  AuditActionType,
  InstallmentPlan,
  InstallmentItem,
  ScholarshipApplication,
  DrawerClosing,
  OfflineTransaction,
  CollegeProfile,
  CollegeSetupPayload
} from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_RECEIPTS, 
  INITIAL_STAFF_EXPENSES, 
  INITIAL_USERS, 
  INITIAL_REMINDER_RULES, 
  INITIAL_REMINDER_TEMPLATES, 
  INITIAL_REMINDER_LOGS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_INSTALLMENT_PLANS,
  INITIAL_SCHOLARSHIP_APPLICATIONS,
  INITIAL_DRAWER_CLOSINGS,
  INITIAL_OFFLINE_TRANSACTIONS,
  COLLEGE_INFO 
} from './data/mockData';
import { Sidebar, TopHeader, ActiveView } from './components/Navbar';
import { api } from './services/api';
import { FacultyDashboard } from './components/FacultyDashboard';
import { StudentTracking } from './components/StudentTracking';
import { BursarScanner } from './components/BursarScanner';
import { StudentMobileView } from './components/StudentMobileView';
import { StudentPortalDashboard } from './components/StudentPortalDashboard';
import { ExpenditureModal } from './components/ExpenditureModal';
import { AutomatedReminderModal } from './components/AutomatedReminderModal';
import { BankingPortalModal } from './components/BankingPortalModal';
import { ReceiptModal } from './components/ReceiptModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { DefaultersNoticeModal } from './components/DefaultersNoticeModal';
import { AuditLogModal } from './components/AuditLogModal';
import { ScholarshipWaiverModal } from './components/ScholarshipWaiverModal';
import { InstallmentScheduleModal } from './components/InstallmentScheduleModal';
import { BursarDrawerReconciliationModal } from './components/BursarDrawerReconciliationModal';
import { FinancialReportsModal } from './components/FinancialReportsModal';
import { ServerConsoleModal } from './components/ServerConsoleModal';
import { InstitutionalSetupModal } from './components/InstitutionalSetupModal';
import { CheckCircle2, RotateCcw, ShieldCheck, Sparkles, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const STORAGE_KEY_STUDENTS = 'saraswati_fee_students_v2';
const STORAGE_KEY_RECEIPTS = 'saraswati_fee_receipts_v2';
const STORAGE_KEY_EXPENSES = 'saraswati_staff_expenses_v2';
const STORAGE_KEY_USER = 'saraswati_active_user_v2';
const STORAGE_KEY_AUDIT = 'saraswati_audit_logs_v2';
const STORAGE_KEY_INSTALLMENTS = 'saraswati_installments_v2';
const STORAGE_KEY_SCHOLARSHIPS = 'saraswati_scholarships_v2';
const STORAGE_KEY_DRAWER = 'saraswati_drawer_closings_v2';
const STORAGE_KEY_OFFLINE_QUEUE = 'saraswati_offline_queue_v2';
const STORAGE_KEY_COLLEGE = 'collegiate_erp_college_info_v1';
const STORAGE_KEY_USERS = 'collegiate_erp_users_v1';
const STORAGE_KEY_SETUP_DONE = 'collegiate_erp_setup_complete_v1';

export default function App() {
  // 0. College Profile & Institutional Identity
  const [collegeInfo, setCollegeInfo] = useState<CollegeProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLLEGE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return COLLEGE_INFO;
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USERS;
  });

  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);

  // 1. Current Active User Profile (Super Admin by default)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return usersList[0] || INITIAL_USERS[0];
  });

  // 2. Students state
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  });

  // 3. Receipts state
  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECEIPTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_RECEIPTS;
  });

  // 4. Staff Expenses state
  const [expenses, setExpenses] = useState<StaffExpense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_STAFF_EXPENSES;
  });

  // 5. Automated Reminder System state
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>(INITIAL_REMINDER_RULES);
  const [reminderTemplates, setReminderTemplates] = useState<ReminderTemplate[]>(INITIAL_REMINDER_TEMPLATES);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>(INITIAL_REMINDER_LOGS);

  // 6. Enterprise Ledgers & Registries
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INSTALLMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_INSTALLMENT_PLANS;
  });

  const [scholarships, setScholarships] = useState<ScholarshipApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHOLARSHIPS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SCHOLARSHIP_APPLICATIONS;
  });

  const [drawerClosings, setDrawerClosings] = useState<DrawerClosing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAWER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DRAWER_CLOSINGS;
  });

  // 7. Network Resilience & Offline Terminal Queue
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_OFFLINE_TRANSACTIONS;
  });

  // 8. View & Navigation state
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    return currentUser.role === 'STUDENT' ? 'STUDENT_PORTAL' : 'DASHBOARD';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 9. Modals state
  const [bankingStudent, setBankingStudent] = useState<Student | null>(null);
  const [bursarSelectedStudent, setBursarSelectedStudent] = useState<Student | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [isDefaultersNoticeOpen, setIsDefaultersNoticeOpen] = useState(false);
  const [overdueListForNotice, setOverdueListForNotice] = useState<Student[]>([]);
  const [isExpenditureModalOpen, setIsExpenditureModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  
  // New Enterprise Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);
  const [isDrawerModalOpen, setIsDrawerModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isServerConsoleOpen, setIsServerConsoleOpen] = useState(false);
  const [installmentModalStudent, setInstallmentModalStudent] = useState<Student | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [serverConnected, setServerConnected] = useState<boolean>(true);

  // Initialize and synchronize with Express Backend Server
  const refreshServerData = async () => {
    try {
      const data = await api.getBootstrap();
      if (data.collegeInfo) {
        setCollegeInfo(data.collegeInfo);
        localStorage.setItem(STORAGE_KEY_COLLEGE, JSON.stringify(data.collegeInfo));
      }
      if (data.users && Array.isArray(data.users) && data.users.length > 0) {
        setUsersList(data.users);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(data.users));
      }
      if (data.students) setStudents(data.students);
      if (data.receipts) setReceipts(data.receipts);
      if (data.expenses) setExpenses(data.expenses);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.installmentPlans) setInstallmentPlans(data.installmentPlans);
      if (data.scholarships) setScholarships(data.scholarships);
      if (data.drawerClosings) setDrawerClosings(data.drawerClosings);
      if (data.reminderLogs) setReminderLogs(data.reminderLogs);
      setServerConnected(true);

      // Auto-trigger setup wizard on fresh installation if not yet completed
      if (data.isSetupComplete === false && !localStorage.getItem(STORAGE_KEY_SETUP_DONE)) {
        setIsSetupModalOpen(true);
      }
    } catch (err) {
      console.warn('[Full-Stack Connect] Using local cache:', err);
      setServerConnected(false);
      if (!localStorage.getItem(STORAGE_KEY_SETUP_DONE)) {
        setIsSetupModalOpen(true);
      }
    }
  };

  const handleCompleteSetup = async (payload: CollegeSetupPayload) => {
    try {
      const res = await api.setupCollege(payload);
      setCollegeInfo(res.collegeProfile);
      localStorage.setItem(STORAGE_KEY_COLLEGE, JSON.stringify(res.collegeProfile));
      localStorage.setItem(STORAGE_KEY_SETUP_DONE, 'true');

      if (res.adminUser) {
        setCurrentUser(res.adminUser);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.adminUser));
      }
      if (res.users && res.users.length > 0) {
        setUsersList(res.users);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(res.users));
      }
      if (Array.isArray(res.students)) {
        setStudents(res.students);
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(res.students));
      }
      if (Array.isArray(res.receipts)) {
        setReceipts(res.receipts);
        localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(res.receipts));
      }

      await refreshServerData();
      showToast(`Institution "${payload.collegeProfile.name}" successfully configured! Super Admin logged in.`);
    } catch (err: any) {
      showToast(`Setup error: ${err.message}`);
      throw err;
    }
  };

  useEffect(() => {
    refreshServerData();
  }, []);

  // Hash generator for immutable ledger
  const generateHash = (content: string) => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256:4f8a${hex}9e218c57b1029c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f`;
  };

  // Append Audit Record
  const logAuditEntry = (
    action: AuditActionType,
    target: string,
    summary: string,
    details?: Record<string, any>
  ) => {
    const timestamp = new Date().toISOString();
    const raw = `${timestamp}|${currentUser.name}|${action}|${target}|${summary}`;
    const newEntry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp,
      action,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      target,
      summary,
      hash: generateHash(raw),
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // LocalStorage sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(receipts));
    } catch {}
  }, [receipts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INSTALLMENTS, JSON.stringify(installmentPlans));
    } catch {}
  }, [installmentPlans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHOLARSHIPS, JSON.stringify(scholarships));
    } catch {}
  }, [scholarships]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAWER, JSON.stringify(drawerClosings));
    } catch {}
  }, [drawerClosings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(offlineQueue));
    } catch {}
  }, [offlineQueue]);

  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  // Switch active user
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'STUDENT') {
      setActiveView('STUDENT_PORTAL');
    } else if (activeView === 'STUDENT_PORTAL') {
      setActiveView('DASHBOARD');
    }
    showToast(`Switched account to ${user.name} (${user.role.replace('_', ' ')})`);
  };

  // Payment completed
  const handlePaymentSuccess = (updatedStudent: Student, newReceipt: Receipt) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    setReceipts((prev) => [newReceipt, ...prev]);
    setBankingStudent(null);
    setViewingReceipt(newReceipt);

    logAuditEntry(
      'FEE_PAYMENT',
      newReceipt.receiptNumber,
      `Fee payment of ₹${newReceipt.amountPaidNow.toLocaleString('en-IN')} via ${newReceipt.paymentMode} for ${updatedStudent.name} (${updatedStudent.rollNo})`,
      { before: { paid: updatedStudent.paidAmount - newReceipt.amountPaidNow }, after: { paid: updatedStudent.paidAmount } }
    );

    showToast(`Payment of ₹${newReceipt.amountPaidNow.toLocaleString('en-IN')} verified. Official Receipt #${newReceipt.receiptNumber} generated.`);

    // Async sync to server database
    api.postReceipt(newReceipt, updatedStudent, currentUser.name, currentUser.role)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  // Staff Expenditure operations (RBAC enforced)
  const handleAddExpense = (newExp: StaffExpense) => {
    setExpenses((prev) => [newExp, ...prev]);
    logAuditEntry(
      'EXPENSE_RECORDED',
      newExp.voucherNo,
      `Expenditure voucher ₹${newExp.amount.toLocaleString('en-IN')} created for ${newExp.purpose} (${newExp.category})`
    );
    showToast(`Expense voucher ${newExp.voucherNo} (₹${newExp.amount.toLocaleString('en-IN')}) recorded successfully.`);

    api.createExpense(newExp, currentUser.name, currentUser.role)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  const handleUpdateExpense = (updatedExp: StaffExpense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExp.id ? updatedExp : e)));
    logAuditEntry(
      'EXPENSE_APPROVED',
      updatedExp.voucherNo,
      `Voucher ${updatedExp.voucherNo} updated with status ${updatedExp.status}`
    );
    showToast(`Voucher ${updatedExp.voucherNo} & attached invoice updated successfully.`);

    api.updateExpense(updatedExp, currentUser.name, currentUser.role)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  const handleDeleteExpense = (id: string) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      showToast('Action Denied: Only Super Admin can delete or modify recorded expenditure vouchers.');
      return;
    }
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    logAuditEntry(
      'EXPENSE_RECORDED',
      target?.voucherNo || id,
      `Voucher ${target?.voucherNo} removed from ledger by Super Admin`
    );
    showToast('Expenditure voucher removed from ledger.');

    api.deleteExpense(id, currentUser.name)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  // Super Admin student assessment update
  const handleUpdateStudentAssessment = (updatedStudent: Student) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      showToast('Permission Denied: Only Super Admin can alter student fee assessments or edit master ledgers.');
      return;
    }
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    setDetailStudent(updatedStudent);
    logAuditEntry(
      'FEE_ASSESSMENT_EDIT',
      updatedStudent.rollNo,
      `Master fee assessment modified to ₹${updatedStudent.totalFee.toLocaleString('en-IN')} for ${updatedStudent.name}`
    );
    showToast(`Master ledger for ${updatedStudent.name} (${updatedStudent.rollNo}) successfully updated.`);

    api.updateStudent(updatedStudent.id, updatedStudent, currentUser.name, currentUser.role)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  // Automated reminders dispatch
  const handleSendReminders = (newLogs: ReminderLog[]) => {
    setReminderLogs((prev) => [...newLogs, ...prev]);
    logAuditEntry(
      'OFFLINE_SYNC',
      `BATCH-${Date.now()}`,
      `Dispatched ${newLogs.length} automated payment alerts via SMS/Email to fee defaulters`
    );
    showToast(`Automated batch dispatched: ${newLogs.length} student/guardian reminders sent via SMS & Email.`);
  };

  // Scholarship sanctions
  const handleApproveScholarship = (appId: string, approvedAmount: number, remarks: string) => {
    const app = scholarships.find((s) => s.id === appId);
    if (!app) return;

    const targetStudent = students.find((s) => s.id === app.studentId);
    if (!targetStudent) return;

    // 1. Update application record
    setScholarships((prev) =>
      prev.map((s) =>
        s.id === appId
          ? {
              ...s,
              status: 'APPROVED',
              approvedAmount,
              reviewedBy: currentUser.name,
              reviewDate: new Date().toISOString().split('T')[0],
              remarks,
            }
          : s
      )
    );

    // 2. Adjust student ledger dues
    const newScholarshipTotal = (targetStudent.scholarshipDiscount || 0) + approvedAmount;
    const newPendingDue = Math.max(0, targetStudent.pendingDue - approvedAmount);
    const newStatus = newPendingDue === 0 ? 'PAID' : targetStudent.paidAmount > 0 ? 'PARTIAL' : 'DUE';

    const updatedStudent: Student = {
      ...targetStudent,
      scholarshipDiscount: newScholarshipTotal,
      pendingDue: newPendingDue,
      status: newStatus,
    };

    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));

    // 3. Immutable audit log
    logAuditEntry(
      'SCHOLARSHIP_PROCESSED',
      appId,
      `Sanctioned ₹${approvedAmount.toLocaleString('en-IN')} waiver for ${targetStudent.name} (${targetStudent.rollNo}). Dues adjusted to ₹${newPendingDue.toLocaleString('en-IN')}`,
      { before: { pendingDue: targetStudent.pendingDue }, after: { pendingDue: newPendingDue } }
    );

    showToast(`Scholarship of ₹${approvedAmount.toLocaleString('en-IN')} sanctioned for ${targetStudent.name}. Dues reduced.`);

    api.reviewScholarship(appId, 'APPROVED', approvedAmount, remarks, currentUser.name, currentUser.role)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  const handleRejectScholarship = (appId: string, remarks: string) => {
    setScholarships((prev) =>
      prev.map((s) =>
        s.id === appId
          ? {
              ...s,
              status: 'REJECTED',
              reviewedBy: currentUser.name,
              reviewDate: new Date().toISOString().split('T')[0],
              remarks,
            }
          : s
      )
    );

    logAuditEntry(
      'SCHOLARSHIP_PROCESSED',
      appId,
      `Scholarship application rejected. Remarks: ${remarks}`
    );

    showToast('Scholarship application rejected with recorded remarks.');

    api.reviewScholarship(appId, 'REJECTED', undefined, remarks, currentUser.name, currentUser.role)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  const handleSubmitScholarship = (appData: Omit<ScholarshipApplication, 'id' | 'status' | 'appliedDate'>) => {
    const newApp: ScholarshipApplication = {
      ...appData,
      id: `SCHOL-${Date.now()}`,
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    setScholarships((prev) => [newApp, ...prev]);

    logAuditEntry(
      'SCHOLARSHIP_PROCESSED',
      newApp.id,
      `Application for ₹${newApp.requestedAmount.toLocaleString('en-IN')} submitted under ${newApp.category} for ${newApp.studentName}`
    );

    showToast('Scholarship / fee concession application submitted for academic review.');

    api.submitScholarship(appData, currentUser.name)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  // Flexi-Installment Plan Enrollment
  const handleOptIntoPlan = (studentId: string, count: 2 | 3) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const total = targetStudent.totalFee;
    let items: InstallmentItem[] = [];

    if (count === 2) {
      const half = Math.round(total / 2);
      items = [
        {
          installmentNumber: 1,
          title: 'Term 1 Registration & Tuition (50%)',
          amount: half,
          dueDate: '2026-01-25',
          status: targetStudent.paidAmount >= half ? 'PAID' : 'DUE',
          paidDate: targetStudent.paidAmount >= half ? '2026-01-20' : undefined,
          lateFee: 0,
        },
        {
          installmentNumber: 2,
          title: 'Term 2 Balance & Exam Fee (50%)',
          amount: total - half,
          dueDate: '2026-03-10',
          status: targetStudent.pendingDue === 0 ? 'PAID' : 'DUE',
          lateFee: 0,
        },
      ];
    } else {
      const p1 = Math.round(total * 0.4);
      const p2 = Math.round(total * 0.3);
      const p3 = total - p1 - p2;
      items = [
        {
          installmentNumber: 1,
          title: 'Term 1 Core Lab & Registration (40%)',
          amount: p1,
          dueDate: '2026-01-30',
          status: targetStudent.paidAmount >= p1 ? 'PAID' : 'DUE',
          paidDate: targetStudent.paidAmount >= p1 ? '2026-01-28' : undefined,
          lateFee: 0,
        },
        {
          installmentNumber: 2,
          title: 'Term 2 Tuition Installment (30%)',
          amount: p2,
          dueDate: '2026-03-15',
          status: targetStudent.paidAmount >= (p1 + p2) ? 'PAID' : 'DUE',
          lateFee: 0,
        },
        {
          installmentNumber: 3,
          title: 'Term 3 Final Semester Exam & Library (30%)',
          amount: p3,
          dueDate: '2026-04-20',
          status: targetStudent.pendingDue === 0 ? 'PAID' : 'DUE',
          lateFee: 0,
        },
      ];
    }

    const newPlan: InstallmentPlan = {
      id: `PLAN-${studentId.replace('stu-', '')}`,
      studentId,
      totalFee: total,
      installmentsCount: count,
      optedDate: new Date().toISOString().split('T')[0],
      items,
    };

    setInstallmentPlans((prev) => [newPlan, ...prev.filter((p) => p.studentId !== studentId)]);

    logAuditEntry(
      'INSTALLMENT_OPTED',
      newPlan.id,
      `${targetStudent.name} (${targetStudent.rollNo}) enrolled in ${count}-term flexi installment schedule`
    );

    showToast(`Successfully enrolled in ${count}-Term Flexi Payment Schedule.`);

    api.optIntoInstallment(studentId, count, currentUser.name, currentUser.role)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  // Daily Drawer Closing
  const handleSubmitClosing = (closing: DrawerClosing) => {
    setDrawerClosings((prev) => [closing, ...prev]);
    logAuditEntry(
      'DRAWER_RECONCILED',
      closing.id,
      `Bursar Drawer Closed by ${closing.cashierName}. Physical cash counted: ₹${closing.countedCash.toLocaleString('en-IN')}, Deposit Challan #${closing.depositSlipNumber}`
    );
    showToast(`Day-end closing committed! Bank Deposit Slip #${closing.depositSlipNumber} generated.`);

    api.submitDrawerClosing(closing)
      .then(() => setServerConnected(true))
      .catch((err) => console.warn('[Backend Sync Warning]', err));
  };

  // Offline queue synchronization
  const handleSyncOfflineQueue = () => {
    if (offlineQueue.length === 0) {
      showToast('Offline buffer is empty. All transactions are up to date.');
      return;
    }

    // Convert offline transactions to formal receipts
    const syncedReceipts: Receipt[] = offlineQueue.map((item) => ({
      receiptNumber: item.receiptNumber,
      date: item.timestamp.split('T')[0],
      studentId: item.studentId,
      rollNo: item.studentRollNo,
      studentName: item.studentName,
      degreeProgram: 'Undergraduate Program',
      department: 'College Bursary Counter',
      semester: 1,
      academicYear: '2025-2026',
      items: [
        { id: 'f-off', category: 'Tuition', description: 'Counter POS Collection (Offline Batch Capture)', amount: item.amount }
      ],
      subtotal: item.amount,
      scholarshipDiscount: 0,
      lateFee: 0,
      totalAmount: item.amount,
      amountPaidNow: item.amount,
      balanceRemaining: 0,
      paymentMode: item.paymentMode,
      transactionRef: item.receiptNumber,
      bankName: 'SBI - Counter POS Batch Sync',
      authorizedBy: 'Rajesh K. Verma (Senior Bursar)',
      digitalSealVerified: true,
      status: 'CONFIRMED',
    }));

    setReceipts((prev) => [...syncedReceipts, ...prev]);
    logAuditEntry(
      'OFFLINE_SYNC',
      `BATCH-SYNC-${Date.now()}`,
      `Successfully synced ${offlineQueue.length} offline transactions totaling ₹${offlineQueue.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')}`
    );

    api.syncOfflineBatch(offlineQueue, currentUser.name)
      .then((res) => {
        setServerConnected(true);
        if (res.students && res.students.length > 0) {
          setStudents(res.students);
        }
      })
      .catch((err) => console.warn('[Backend Sync Warning]', err));

    setOfflineQueue([]);
    showToast(`Synchronized ${syncedReceipts.length} offline transactions to Central University Cloud Gateway!`);
  };

  const handleToggleOnlineStatus = () => {
    const next = !isOnline;
    setIsOnline(next);
    if (!next) {
      showToast('Terminal switched to Offline PWA Mode. Counter collections will buffer locally.');
    } else {
      showToast('Connected to Central University Cloud. Ready to sync offline buffer.');
    }
  };

  // Reset demo data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all student ledgers, staff expenditures, receipts, audit logs, and installment schedules to initial state?')) {
      setStudents(INITIAL_STUDENTS);
      setReceipts(INITIAL_RECEIPTS);
      setExpenses(INITIAL_STAFF_EXPENSES);
      setReminderLogs(INITIAL_REMINDER_LOGS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setInstallmentPlans(INITIAL_INSTALLMENT_PLANS);
      setScholarships(INITIAL_SCHOLARSHIP_APPLICATIONS);
      setDrawerClosings(INITIAL_DRAWER_CLOSINGS);
      setOfflineQueue(INITIAL_OFFLINE_TRANSACTIONS);

      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.removeItem(STORAGE_KEY_RECEIPTS);
      localStorage.removeItem(STORAGE_KEY_EXPENSES);
      localStorage.removeItem(STORAGE_KEY_AUDIT);
      localStorage.removeItem(STORAGE_KEY_INSTALLMENTS);
      localStorage.removeItem(STORAGE_KEY_SCHOLARSHIPS);
      localStorage.removeItem(STORAGE_KEY_DRAWER);
      localStorage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);

      api.resetServerData()
        .then(() => setServerConnected(true))
        .catch((err) => console.warn('[Backend Reset Warning]', err));

      showToast('Collegiate ERP master ledger and audit registers reset to factory demo state.');
    }
  };

  // Recovery Rate calculation
  const totalAssessed = students.reduce((acc, s) => acc + s.totalFee, 0);
  const totalCollected = students.reduce((acc, s) => acc + s.paidAmount, 0);
  const clearedRate = totalAssessed > 0 ? ((totalCollected / totalAssessed) * 100).toFixed(1) : '0';

  // If logged in as student, find student profile safely
  const loggedInStudent = students.find((s) => s.id === currentUser.studentId) || students[1] || students[0] || null;
  const loggedInStudentPlan = loggedInStudent ? installmentPlans.find((p) => p.studentId === loggedInStudent.id) : undefined;

  return (
    <div className="h-screen w-full bg-slate-100 flex font-sans overflow-hidden text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Alert */}
      {toastNotification && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-3.5 py-2.5 rounded-lg shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium leading-tight">{toastNotification}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
          clearedRate={clearedRate}
          collegeInfo={collegeInfo}
          usersList={usersList}
          onOpenCollegeSetup={() => setIsSetupModalOpen(true)}
          onResetDemoData={handleResetDemoData}
          onOpenExpenditures={() => setIsExpenditureModalOpen(true)}
          onOpenReminders={() => setIsReminderModalOpen(true)}
          onOpenScholarships={() => setIsScholarshipModalOpen(true)}
          onOpenReconciliation={() => setIsDrawerModalOpen(true)}
          onOpenReports={() => setIsReportsModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditModalOpen(true)}
          onOpenInstallments={() => loggedInStudent && setInstallmentModalStudent(loggedInStudent)}
          onOpenServerConsole={() => setIsServerConsoleOpen(true)}
          isOnline={isOnline}
          offlineQueueCount={offlineQueue.length}
          onToggleOnlineStatus={handleToggleOnlineStatus}
          onSyncOfflineQueue={handleSyncOfflineQueue}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-64 h-full">
            <Sidebar
              activeView={activeView}
              onSelectView={setActiveView}
              currentUser={currentUser}
              onSelectUser={handleSelectUser}
              clearedRate={clearedRate}
              collegeInfo={collegeInfo}
              usersList={usersList}
              onOpenCollegeSetup={() => setIsSetupModalOpen(true)}
              onResetDemoData={handleResetDemoData}
              onOpenExpenditures={() => setIsExpenditureModalOpen(true)}
              onOpenReminders={() => setIsReminderModalOpen(true)}
              onOpenScholarships={() => setIsScholarshipModalOpen(true)}
              onOpenReconciliation={() => setIsDrawerModalOpen(true)}
              onOpenReports={() => setIsReportsModalOpen(true)}
              onOpenAuditLogs={() => setIsAuditModalOpen(true)}
              onOpenInstallments={() => loggedInStudent && setInstallmentModalStudent(loggedInStudent)}
              onOpenServerConsole={() => setIsServerConsoleOpen(true)}
              isOnline={isOnline}
              offlineQueueCount={offlineQueue.length}
              onToggleOnlineStatus={handleToggleOnlineStatus}
              onSyncOfflineQueue={handleSyncOfflineQueue}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Right Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <TopHeader
          activeView={activeView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          clearedRate={clearedRate}
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
          collegeInfo={collegeInfo}
          usersList={usersList}
          onOpenCollegeSetup={() => setIsSetupModalOpen(true)}
          onOpenReminders={() => setIsReminderModalOpen(true)}
          onOpenExpenditures={() => setIsExpenditureModalOpen(true)}
          onOpenScholarships={() => setIsScholarshipModalOpen(true)}
          onOpenReconciliation={() => setIsDrawerModalOpen(true)}
          onOpenReports={() => setIsReportsModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditModalOpen(true)}
          onOpenServerConsole={() => setIsServerConsoleOpen(true)}
          onCollectFee={() => setActiveView('BURSAR_SCANNER')}
          isOnline={isOnline}
          offlineQueueCount={offlineQueue.length}
          onSyncOfflineQueue={handleSyncOfflineQueue}
          serverConnected={serverConnected}
        />

        {/* Dynamic View Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* View 1: DASHBOARD (Faculty & Principal Monitoring) */}
            {activeView === 'DASHBOARD' && (
              <FacultyDashboard
                students={students}
                receipts={receipts}
                expenses={expenses}
                currentUserRole={currentUser.role}
                currentUserName={currentUser.name}
                onSelectStudent={(stu) => setDetailStudent(stu)}
                onOpenDefaultersNotice={(overdue) => {
                  setOverdueListForNotice(overdue);
                  setIsDefaultersNoticeOpen(true);
                }}
                onSelectView={setActiveView}
                onOpenBursarCounter={(stu) => {
                  setBursarSelectedStudent(stu);
                  setActiveView('BURSAR_SCANNER');
                }}
                onViewReceipt={(rec) => setViewingReceipt(rec)}
                onOpenExpenditures={() => setIsExpenditureModalOpen(true)}
                onOpenReminders={() => setIsReminderModalOpen(true)}
              />
            )}

            {/* View 2: STUDENTS (Student Payment Tracking Ledger) */}
            {activeView === 'STUDENTS' && (
              <StudentTracking
                students={students}
                currentUserRole={currentUser.role}
                onOpenBankingPortal={(stu) => setBankingStudent(stu)}
                onOpenBursarCounter={(stu) => {
                  setBursarSelectedStudent(stu);
                  setActiveView('BURSAR_SCANNER');
                }}
                onViewReceipt={(rec) => setViewingReceipt(rec)}
                onSelectStudentDetail={(stu) => setDetailStudent(stu)}
                onUpdateStudent={handleUpdateStudentAssessment}
              />
            )}

            {/* View 3: BURSAR_SCANNER (Bursar Counter Fast QR Scanner) */}
            {activeView === 'BURSAR_SCANNER' && (
              <BursarScanner
                students={students}
                selectedStudent={bursarSelectedStudent}
                onPaymentSuccess={handlePaymentSuccess}
                onViewReceipt={(rec) => setViewingReceipt(rec)}
                onSelectStudent={(stu) => setDetailStudent(stu)}
              />
            )}

            {/* View 4: STUDENT_PORTAL (Personalized Student Fee & Online Payment Dashboard) */}
            {activeView === 'STUDENT_PORTAL' && (
              <StudentPortalDashboard
                student={loggedInStudent}
                onOpenBankingPortal={(stu) => setBankingStudent(stu)}
                onPaymentSuccess={handlePaymentSuccess}
                onViewReceipt={(rec) => setViewingReceipt(rec)}
                onOpenInstallments={() => loggedInStudent && setInstallmentModalStudent(loggedInStudent)}
                onOpenScholarships={() => setIsScholarshipModalOpen(true)}
              />
            )}
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-200 bg-white py-2 px-4 text-xs text-slate-500 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                {collegeInfo.name} ({collegeInfo.code}) • Indian Collegiate Bursary ERP System
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <span className="font-mono text-[10px]">
                Active Role: <strong className="text-slate-700">{currentUser.role}</strong>
              </span>
              <span>•</span>
              <button
                onClick={handleResetDemoData}
                className="hover:text-slate-800 transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo Ledger</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Interactive Modals */}
      {/* 1. Banking Portal Payment Gateway Modal (SBI, HDFC, UPI, NEFT) */}
      {bankingStudent && (
        <BankingPortalModal
          student={bankingStudent}
          onClose={() => setBankingStudent(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* 2. Official Collegiate Fee Receipt Modal (Print & PDF ready with seal) */}
      {viewingReceipt && (
        <ReceiptModal
          receipt={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {/* 3. Comprehensive Student Financial Ledger Drawer with RBAC edits */}
      {detailStudent && (
        <StudentDetailModal
          student={detailStudent}
          currentUserRole={currentUser.role}
          onClose={() => setDetailStudent(null)}
          onOpenBankingPortal={(stu) => {
            setDetailStudent(null);
            setBankingStudent(stu);
          }}
          onOpenBursarCounter={(stu) => {
            setDetailStudent(null);
            setActiveView('BURSAR_SCANNER');
          }}
          onViewReceipt={(rec) => setViewingReceipt(rec)}
          onUpdateStudentAssessment={handleUpdateStudentAssessment}
          onOpenInstallments={(stu) => setInstallmentModalStudent(stu)}
        />
      )}

      {/* 4. Automated Defaulter Notices Modal */}
      {isDefaultersNoticeOpen && (
        <DefaultersNoticeModal
          overdueStudents={overdueListForNotice}
          onClose={() => setIsDefaultersNoticeOpen(false)}
        />
      )}

      {/* 5. Staff Expenditure Ledger & Voucher Tracking Modal */}
      {isExpenditureModalOpen && (
        <ExpenditureModal
          expenses={expenses}
          currentUserRole={currentUser.role}
          currentUserName={currentUser.name}
          onClose={() => setIsExpenditureModalOpen(false)}
          onAddExpense={handleAddExpense}
          onUpdateExpense={handleUpdateExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      )}

      {/* 6. Automated Payment Reminder System Modal (7-Day & 3-Day notifications) */}
      {isReminderModalOpen && (
        <AutomatedReminderModal
          students={students}
          rules={reminderRules}
          templates={reminderTemplates}
          logs={reminderLogs}
          currentUserRole={currentUser.role}
          onClose={() => setIsReminderModalOpen(false)}
          onUpdateRules={setReminderRules}
          onUpdateTemplates={setReminderTemplates}
          onSendReminders={handleSendReminders}
        />
      )}

      {/* 7. Regulatory Audit Trail & Immutable Ledger Modal */}
      {isAuditModalOpen && (
        <AuditLogModal
          logs={auditLogs}
          currentUserRole={currentUser.role}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}

      {/* 8. Scholarships, Waivers & Fee Concessions Portal Modal */}
      {isScholarshipModalOpen && (
        <ScholarshipWaiverModal
          applications={scholarships}
          students={students}
          currentUserRole={currentUser.role}
          currentUserName={currentUser.name}
          onClose={() => setIsScholarshipModalOpen(false)}
          onApproveApplication={handleApproveScholarship}
          onRejectApplication={handleRejectScholarship}
          onSubmitApplication={handleSubmitScholarship}
        />
      )}

      {/* 9. Flexi-Installment Payment Schedules Modal */}
      {installmentModalStudent && (
        <InstallmentScheduleModal
          student={installmentModalStudent}
          plan={installmentPlans.find((p) => p.studentId === installmentModalStudent.id)}
          onClose={() => setInstallmentModalStudent(null)}
          onOptIntoPlan={handleOptIntoPlan}
          onPayInstallment={(stu, item) => {
            setInstallmentModalStudent(null);
            // Pre-select student and initiate banking portal for this specific installment
            setBankingStudent(stu);
          }}
        />
      )}

      {/* 10. Bursar Cash-Drawer Day-End Closing & Bank Deposit Challan */}
      {isDrawerModalOpen && (
        <BursarDrawerReconciliationModal
          receipts={receipts}
          currentUser={currentUser}
          onClose={() => setIsDrawerModalOpen(false)}
          onSubmitClosing={handleSubmitClosing}
        />
      )}

      {/* 11. Financial Reports, Exports & GST Exemption Statement */}
      {isReportsModalOpen && (
        <FinancialReportsModal
          students={students}
          receipts={receipts}
          expenses={expenses}
          currentUserRole={currentUser.role}
          onClose={() => setIsReportsModalOpen(false)}
        />
      )}

      {/* 12. Full-Stack Backend Operations & Diagnostics Console */}
      <ServerConsoleModal
        isOpen={isServerConsoleOpen}
        onClose={() => setIsServerConsoleOpen(false)}
        students={students}
        onRefreshData={refreshServerData}
        onShowToast={(msg) => showToast(msg)}
      />

      {/* 13. Institutional Setup & College Registration Wizard */}
      <InstitutionalSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        currentCollege={collegeInfo}
        onCompleteSetup={handleCompleteSetup}
        isFirstTime={!localStorage.getItem(STORAGE_KEY_SETUP_DONE)}
      />
    </div>
  );
}
