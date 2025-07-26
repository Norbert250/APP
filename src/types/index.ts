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
}