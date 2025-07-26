import { User, LoanApplication, Notification, Payment } from '@/types';

export const mockUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  createdAt: '2024-01-15T10:00:00Z',
  kycStatus: 'verified',
  creditScore: 720,
};

export const mockLoanApplications: LoanApplication[] = [
  {
    id: 'loan-1',
    userId: 'user-1',
    sector: 'formal',
    formData: {
      amount: '50000',
      repaymentDate: '2025-12-31',
      hasRetailBusiness: false,
      businessRegNumber: '',
      businessLocation: '',
      guarantor1: { name: 'Jane Smith', id: '123456789', contact: '+1234567891' },
      guarantor2: { name: 'Bob Johnson', id: '987654321', contact: '+1234567892' },
      allowPermissions: true,
      uploadedAssets: [],
      uploadedDocuments: [],
    },
    status: 'approved',
    submittedAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-16T14:30:00Z',
    amount: 50000,
    repaymentDate: '2025-12-31',
    interestRate: 12.5,
    monthlyPayment: 4500,
    totalAmount: 54000,
  },
  {
    id: 'loan-2',
    userId: 'user-1',
    sector: 'informal',
    formData: {
      amount: '25000',
      repaymentDate: '2025-06-30',
      hasRetailBusiness: true,
      businessRegNumber: 'BR123456',
      businessLocation: '123 Market Street',
      guarantor1: { name: 'Alice Brown', id: '456789123', contact: '+1234567893' },
      guarantor2: { name: 'Charlie Wilson', id: '789123456', contact: '+1234567894' },
      allowPermissions: true,
      uploadedAssets: [],
      uploadedDocuments: [],
    },
    status: 'pending',
    submittedAt: '2024-12-20T09:15:00Z',
    updatedAt: '2024-12-20T09:15:00Z',
    amount: 25000,
    repaymentDate: '2025-06-30',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Loan Approved!',
    message: 'Your loan application for $50,000 has been approved. Funds will be disbursed within 24 hours.',
    type: 'success',
    read: false,
    createdAt: '2024-12-16T14:30:00Z',
  },
  {
    id: 'notif-2',
    title: 'Payment Reminder',
    message: 'Your monthly payment of $4,500 is due in 3 days.',
    type: 'warning',
    read: false,
    createdAt: '2024-12-18T10:00:00Z',
  },
  {
    id: 'notif-3',
    title: 'Document Required',
    message: 'Please upload your updated bank statement for loan application review.',
    type: 'info',
    read: true,
    createdAt: '2024-12-10T16:45:00Z',
  },
];

export const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    loanId: 'loan-1',
    amount: 4500,
    dueDate: '2025-01-31',
    status: 'pending',
  },
  {
    id: 'payment-2',
    loanId: 'loan-1',
    amount: 4500,
    dueDate: '2025-02-28',
    status: 'pending',
  },
];