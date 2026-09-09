export type PaymentStatus = 'CLEARED' | 'PARTIAL' | 'OVERDUE' | 'UNPAID';

export type UserRole = 'SUPER_ADMIN' | 'PRINCIPAL' | 'ACCOUNT_STAFF' | 'STUDENT';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  designation: string;
  department?: string;
  avatarUrl: string;
  studentRollNo?: string;
  phone?: string;
}

export type PaymentMode = 
  | 'UPI' 
  | 'NET_BANKING' 
  | 'DEBIT_CREDIT_CARD' 
  | 'NEFT_RTGS' 
  | 'BURSAR_CASH_COUNTER' 
  | 'BURSAR_POS';

export interface FeeItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  receiptNumber: string;
  amount: number;
  date: string;
  paymentMode: PaymentMode;
  bankName: string;
  transactionRef: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'RECONCILED';
  remarks?: string;
}

export interface Receipt {
  receiptNumber: string;
  date: string;
  studentId: string;
  rollNo: string;
  studentName: string;
  degreeProgram: string;
  department: string;
  semester: number;
  academicYear: string;
  items: FeeItem[];
  subtotal: number;
  scholarshipDiscount: number;
  lateFee: number;
  totalAmount: number;
  amountPaidNow: number;
  balanceRemaining: number;
  paymentMode: PaymentMode;
  transactionRef: string;
  bankName: string;
  authorizedBy: string;
  digitalSealVerified: boolean;
  status: 'PAID' | 'RECONCILED';
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  avatarUrl: string;
  department: string;
  degreeProgram: string;
  semester: number;
  academicYear: string;
  totalFee: number;
  paidAmount: number;
  pendingDue: number;
  dueDate: string;
  status: PaymentStatus;
  scholarshipQuota?: string;
  feeItems: FeeItem[];
  paymentHistory: PaymentRecord[];
  qrToken: string;
}

// Staff Expenditure tracking
export type StaffExpenseCategory =
  | 'LAB_EQUIPMENT'
  | 'LIBRARY_BOOKS'
  | 'CAMPUS_MAINTENANCE'
  | 'EXAMINATION_PRINTING'
  | 'SEMINAR_EVENTS'
  | 'STATIONERY'
  | 'FACULTY_HONORARIUM'
  | 'SPORTS_CULTURE';

export interface StaffExpense {
  id: string;
  voucherNo: string;
  date: string;
  staffName: string;
  staffId: string;
  department: string;
  designation: string;
  category: StaffExpenseCategory;
  purpose: string;
  amount: number;
  paymentMode: 'NEFT_RTGS' | 'CHEQUE' | 'UPI' | 'PETTY_CASH';
  status: 'APPROVED' | 'PENDING' | 'REIMBURSED';
  receiptAttached: boolean;
  authorizedBy: string;
  remarks?: string;

  // Bill / Tax Invoice Upload details
  billUrl?: string; // Data URL or preview image/document
  billFileName?: string;
  billFileType?: string; // e.g. 'application/pdf', 'image/png', 'image/jpeg'
  billFileSize?: string; // e.g. '1.4 MB'
  billUploadedAt?: string;
  vendorName?: string;
  vendorGstin?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  isBillVerified?: boolean;
  auditedBy?: string;
  auditRemarks?: string;
}

// Automated Reminder System Types
export type ReminderChannel = 'EMAIL' | 'SMS' | 'BOTH';
export type ReminderTriggerType = 'DUE_IN_7_DAYS' | 'OVERDUE_BY_3_DAYS';

export interface ReminderRule {
  id: string;
  triggerType: ReminderTriggerType;
  title: string;
  description: string;
  daysOffset: number; // 7 for 7 days before, -3 for 3 days overdue
  channel: ReminderChannel;
  enabled: boolean;
  notifyStudent: boolean;
  notifyParent: boolean;
  templateId: string;
}

export interface ReminderTemplate {
  id: string;
  triggerType: ReminderTriggerType;
  name: string;
  emailSubject: string;
  emailBody: string;
  smsMessage: string;
  lastUpdated: string;
}

export interface ReminderLog {
  id: string;
  timestamp: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  parentName: string;
  recipientEmail: string;
  recipientPhone: string;
  triggerType: ReminderTriggerType;
  channel: 'EMAIL' | 'SMS';
  subjectOrPreview: string;
  messageContent: string;
  amountDue: number;
  dueDate: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  deliveryMode: 'AUTOMATED_CRON' | 'MANUAL_DISPATCH';
}

export interface BankPortal {
  id: string;
  name: string;
  code: string;
  logoColor: string;
  type: 'GATEWAY' | 'NET_BANKING' | 'UPI' | 'CHALLAN';
  feePercentage: number;
  popular: boolean;
}

export interface FacultyTrendData {
  month: string;
  target: number;
  collected: number;
  bursarCash: number;
  bankPortals: number;
  expenditures: number;
}

export interface DepartmentSummary {
  department: string;
  code: string;
  totalStudents: number;
  assessed: number;
  collected: number;
  expenditure: number;
  pending: number;
  clearedRate: number;
}

// Custom Installments & Flexi-Payment Schedules
export interface InstallmentItem {
  installmentNumber: number;
  title: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'DUE' | 'OVERDUE';
  paidDate?: string;
  transactionRef?: string;
  lateFee: number;
}

export interface InstallmentPlan {
  id: string;
  studentId: string;
  totalFee: number;
  installmentsCount: number;
  optedDate: string;
  items: InstallmentItem[];
}

// Scholarship & Fee Waiver Workflows
export type ScholarshipCategory = 
  | 'MERIT' 
  | 'EWS_AID' 
  | 'SPORTS_QUOTA' 
  | 'FACULTY_WARD' 
  | 'SPECIAL_CONCESSION';

export interface ScholarshipApplication {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  category: ScholarshipCategory;
  requestedAmount: number;
  approvedAmount?: number;
  reason: string;
  documentName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  remarks?: string;
}

// Audit Logging & Immutable Ledgers
export type AuditActionType =
  | 'FEE_PAYMENT'
  | 'FEE_ASSESSMENT_EDIT'
  | 'SCHOLARSHIP_PROCESSED'
  | 'INSTALLMENT_OPTED'
  | 'EXPENSE_RECORDED'
  | 'EXPENSE_APPROVED'
  | 'DRAWER_RECONCILED'
  | 'OFFLINE_SYNC';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditActionType;
  actorName: string;
  actorRole: string;
  target: string;
  summary: string;
  hash: string;
  details?: Record<string, any>;
}

// Daily Bursar Closing & Cash Reconciliation
export interface DrawerClosing {
  id: string;
  date: string;
  cashierName: string;
  openingCash: number;
  systemCash: number;
  countedCash: number;
  posSlipAmount: number;
  upiAmount: number;
  denominations: Record<string, number>;
  variance: number;
  depositSlipNumber: string;
  bankName: string;
  status: 'SUBMITTED' | 'AUDITED';
  notes?: string;
}

// Offline Terminal Transaction
export interface OfflineTransaction {
  id: string;
  timestamp: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  amount: number;
  paymentMode: PaymentMode;
  receiptNumber: string;
  synced: boolean;
}

// Enterprise Backend Analytics & Server Management Types
export interface ServerAnalyticsSummary {
  totalAssessed: number;
  totalCollected: number;
  totalPendingDue: number;
  totalConcessions: number;
  totalExpenditures: number;
  netTreasuryBalance: number;
  recoveryRate: number;
  clearedStudentsCount: number;
  partialStudentsCount: number;
  overdueStudentsCount: number;
  unpaidStudentsCount: number;
  departmentBreakdown: {
    department: string;
    assessed: number;
    collected: number;
    pending: number;
    studentCount: number;
    recoveryRate: number;
  }[];
  paymentModeBreakdown: {
    mode: string;
    amount: number;
    count: number;
  }[];
}

export interface DefaulterAgingSummary {
  bucket1to7Days: { count: number; totalAmount: number; students: { id: string; name: string; rollNo: string; pendingDue: number; daysOverdue: number }[] };
  bucket8to15Days: { count: number; totalAmount: number; students: { id: string; name: string; rollNo: string; pendingDue: number; daysOverdue: number }[] };
  bucket16to30Days: { count: number; totalAmount: number; students: { id: string; name: string; rollNo: string; pendingDue: number; daysOverdue: number }[] };
  bucketOver30Days: { count: number; totalAmount: number; students: { id: string; name: string; rollNo: string; pendingDue: number; daysOverdue: number }[] };
}

export interface BankWebhookEvent {
  event: 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED';
  gateway: 'SBI_EPAY' | 'HDFC_SMARTHUB' | 'UPI_INTENT' | 'RAZORPAY';
  transactionRef: string;
  studentRollNo: string;
  amount: number;
  timestamp: string;
  bankUtrNumber: string;
  hmacSignature: string;
}

export interface BankReconciliationMatch {
  utrNumber: string;
  receiptNumber: string;
  studentName: string;
  amount: number;
  matched: boolean;
  status: 'RECONCILED' | 'UNMATCHED';
}

export interface BankReconciliationResult {
  totalSubmitted: number;
  matchedCount: number;
  unmatchedCount: number;
  totalReconciledAmount: number;
  matches: BankReconciliationMatch[];
}

export interface ServerJobResult {
  jobName: string;
  executedAt: string;
  recordsAffected: number;
  summary: string;
  details?: Record<string, any>;
}

export interface CollegeProfile {
  name: string;
  accreditation: string;
  code: string;
  address: string;
  bursarEmail: string;
  bursarPhone: string;
  academicYear: string;
  currentSemester: string;
  currencySymbol?: string;
  currencyCode?: string;
  isSetupComplete?: boolean;
}

export interface AdminCredentials {
  adminName: string;
  adminEmail: string;
  adminDesignation: string;
  adminRole: UserRole;
  password?: string;
  recoveryPin?: string;
}

export interface CollegeSetupPayload {
  collegeProfile: CollegeProfile;
  adminCredentials: AdminCredentials;
  initializationMode: 'CLEAN_SLATE' | 'SAMPLE_DATA';
}


