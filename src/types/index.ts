export interface FormData {
  amount: string;
  repaymentDate: string;
  hasRetailBusiness: boolean;
  businessRegNumber: string;
  businessLocation: string;
  guarantor1: GuarantorInfo;
  guarantor2: GuarantorInfo;
  allowPermissions: boolean;
  uploadedAssets: UploadedFile[];
  uploadedDocuments: UploadedFile[];
}

export interface GuarantorInfo {
  name: string;
  id: string;
  contact: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  uri: string;
  type: string;
  size?: number;
  assetInfo?: {
    type: string;
    requiresLicense: boolean;
    estimatedValue: 'low' | 'medium' | 'high';
    name: string;
    hasLicense?: boolean;
    licenseUri?: string;
  };
}

export type SectorType = 'formal' | 'informal';

export interface LoanApplication {
  id: string;
  userId: string;
  sector: SectorType;
  formData: FormData;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
  updatedAt: string;
  amount: number;
  repaymentDate: string;
  interestRate?: number;
  monthlyPayment?: number;
  totalAmount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  createdAt: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  creditScore?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: string;
}