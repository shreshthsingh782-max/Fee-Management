import { 
  Student, 
  Receipt, 
  StaffExpense, 
  AuditLogEntry, 
  InstallmentPlan, 
  ScholarshipApplication, 
  DrawerClosing, 
  OfflineTransaction, 
  ReminderLog,
  ServerAnalyticsSummary,
  DefaulterAgingSummary,
  BankWebhookEvent,
  BankReconciliationResult,
  ServerJobResult,
  CollegeProfile,
  CollegeSetupPayload
} from '../types';

export interface BootstrapData {
  collegeInfo: CollegeProfile;
  isSetupComplete?: boolean;
  adminCredentials?: any;
  users: any[];
  reminderRules: any[];
  reminderTemplates: any[];
  students: Student[];
  receipts: Receipt[];
  expenses: StaffExpense[];
  auditLogs: AuditLogEntry[];
  installmentPlans: InstallmentPlan[];
  scholarships: ScholarshipApplication[];
  drawerClosings: DrawerClosing[];
  reminderLogs: ReminderLog[];
}

export interface ServerHealth {
  status: string;
  architecture: string;
  framework: string;
  serverTime: string;
  uptimeSeconds: number;
  records: Record<string, number>;
}

export const api = {
  async getHealth(): Promise<ServerHealth> {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Backend server unavailable');
    return res.json();
  },

  async getBootstrap(): Promise<BootstrapData> {
    const res = await fetch('/api/bootstrap');
    if (!res.ok) throw new Error('Failed to fetch bootstrap data from server');
    return res.json();
  },

  async getStudents(): Promise<Student[]> {
    const res = await fetch('/api/students');
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async updateStudent(studentId: string, data: Partial<Student>, actorName?: string, actorRole?: string): Promise<Student> {
    const res = await fetch(`/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, actorName, actorRole }),
    });
    if (!res.ok) throw new Error('Failed to update student');
    return res.json();
  },

  async postReceipt(receipt: Receipt, updatedStudent?: Student, actorName?: string, actorRole?: string): Promise<{ success: boolean; receipt: Receipt }> {
    const res = await fetch('/api/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receipt, updatedStudent, actorName, actorRole }),
    });
    if (!res.ok) throw new Error('Failed to record receipt on server');
    return res.json();
  },

  async getReceiptVerification(receiptNumber: string) {
    const res = await fetch(`/api/receipts/${receiptNumber}`);
    if (!res.ok) throw new Error('Receipt not verified');
    return res.json();
  },

  async createExpense(expense: StaffExpense, actorName?: string, actorRole?: string): Promise<{ success: boolean; expense: StaffExpense }> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense, actorName, actorRole }),
    });
    if (!res.ok) throw new Error('Failed to record expense');
    return res.json();
  },

  async updateExpense(expense: StaffExpense, actorName?: string, actorRole?: string): Promise<{ success: boolean; expense: StaffExpense }> {
    const res = await fetch(`/api/expenses/${expense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense, actorName, actorRole }),
    });
    if (!res.ok) throw new Error('Failed to update expense');
    return res.json();
  },

  async deleteExpense(expenseId: string, actorName?: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName }),
    });
    if (!res.ok) throw new Error('Failed to delete expense');
    return res.json();
  },

  async submitScholarship(application: Omit<ScholarshipApplication, 'id' | 'status' | 'appliedDate'>, actorName?: string): Promise<ScholarshipApplication> {
    const res = await fetch('/api/scholarships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...application, actorName }),
    });
    if (!res.ok) throw new Error('Failed to submit scholarship');
    return res.json();
  },

  async reviewScholarship(id: string, status: 'APPROVED' | 'REJECTED', approvedAmount?: number, remarks?: string, reviewerName?: string, reviewerRole?: string): Promise<{ success: boolean; scholarship: ScholarshipApplication; students: Student[] }> {
    const res = await fetch(`/api/scholarships/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, approvedAmount, remarks, reviewerName, reviewerRole }),
    });
    if (!res.ok) throw new Error('Failed to review scholarship');
    return res.json();
  },

  async optIntoInstallment(studentId: string, count: 2 | 3, actorName?: string, actorRole?: string): Promise<InstallmentPlan> {
    const res = await fetch('/api/installments/opt-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, count, actorName, actorRole }),
    });
    if (!res.ok) throw new Error('Failed to opt into installment schedule');
    return res.json();
  },

  async submitDrawerClosing(closing: DrawerClosing): Promise<DrawerClosing> {
    const res = await fetch('/api/drawer-closings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(closing),
    });
    if (!res.ok) throw new Error('Failed to record drawer closing');
    return res.json();
  },

  async syncOfflineBatch(transactions: OfflineTransaction[], actorName?: string): Promise<{ success: boolean; syncedCount: number; receipts: Receipt[]; students: Student[] }> {
    const res = await fetch('/api/offline/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, actorName }),
    });
    if (!res.ok) throw new Error('Failed to sync offline batch with server');
    return res.json();
  },

  async sendReminders(logs: ReminderLog[], actorName?: string): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/reminders/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs, actorName }),
    });
    if (!res.ok) throw new Error('Failed to dispatch reminders');
    return res.json();
  },

  async resetServerData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset server data');
    return res.json();
  },

  // Enterprise Server Analytics & Reporting
  async getAnalyticsSummary(): Promise<ServerAnalyticsSummary> {
    const res = await fetch('/api/analytics/summary');
    if (!res.ok) throw new Error('Failed to fetch analytics summary');
    return res.json();
  },

  async getDefaultersAging(): Promise<DefaulterAgingSummary> {
    const res = await fetch('/api/analytics/defaulters-aging');
    if (!res.ok) throw new Error('Failed to fetch defaulters aging breakdown');
    return res.json();
  },

  async searchStudents(params: { q?: string; department?: string; status?: string; semester?: number; page?: number; limit?: number }): Promise<{ students: Student[]; total: number; page: number; totalPages: number; limit: number }> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.department) query.set('department', params.department);
    if (params.status) query.set('status', params.status);
    if (params.semester) query.set('semester', params.semester.toString());
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`/api/students/search?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to search students');
    return res.json();
  },

  // Bank Gateway Webhook Simulator
  async simulateBankWebhook(event: BankWebhookEvent): Promise<{ success: boolean; duplicate: boolean; message: string; receipt?: Receipt; student?: Student }> {
    const res = await fetch('/api/webhooks/bank-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to simulate bank webhook');
    }
    return res.json();
  },

  // Scheduled Server Jobs
  async runDailyOverdueJob(): Promise<ServerJobResult> {
    const res = await fetch('/api/jobs/run-daily-overdue-check', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run daily overdue check');
    return res.json();
  },

  async verifyAuditChain(actorName?: string): Promise<ServerJobResult> {
    const res = await fetch('/api/jobs/reconcile-audit-chain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName }),
    });
    if (!res.ok) throw new Error('Failed to verify audit chain');
    return res.json();
  },

  // Bank Statement UTR Reconciliation
  async reconcileBankStatement(utrEntries: { utrNumber: string; amount: number; date?: string }[], actorName?: string): Promise<BankReconciliationResult> {
    const res = await fetch('/api/bursar/reconcile-bank-statement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utrEntries, actorName }),
    });
    if (!res.ok) throw new Error('Failed to reconcile bank statement');
    return res.json();
  },

  // Server Diagnostics & Metrics
  async getServerMetrics() {
    const res = await fetch('/api/admin/metrics');
    if (!res.ok) throw new Error('Failed to fetch server metrics');
    return res.json();
  },

  async downloadDatabaseBackup(): Promise<any> {
    const res = await fetch('/api/admin/backup');
    if (!res.ok) throw new Error('Failed to download database backup');
    return res.json();
  },

  async restoreDatabaseBackup(database: any, actorName?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ database, actorName }),
    });
    if (!res.ok) throw new Error('Failed to restore database');
    return res.json();
  },

  // First-Time College Setup & Registration
  async getCollegeConfig(): Promise<{ collegeProfile: CollegeProfile; isSetupComplete: boolean; adminCredentials?: any; totalStudents: number; totalReceipts: number }> {
    const res = await fetch('/api/college/config');
    if (!res.ok) throw new Error('Failed to fetch college config');
    return res.json();
  },

  async setupCollege(payload: CollegeSetupPayload): Promise<{ success: boolean; message: string; collegeProfile: CollegeProfile; adminUser: any; students: Student[]; receipts: Receipt[]; users: any[] }> {
    const res = await fetch('/api/college/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to complete college setup');
    }
    return res.json();
  },

  async resetSetupState(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/college/reset-setup-state', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset setup wizard state');
    return res.json();
  },
};
