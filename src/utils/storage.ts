import { User, LoanApplication, Notification } from '../types';

// Local storage utilities
export const storage = {
  setItem: (key: string, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getItem: <T>(key: string): T | null => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
};

// User management
export const userStorage = {
  saveUser: (user: User): void => {
    storage.setItem('user', user);
  },

  getUser: (): User | null => {
    return storage.getItem<User>('user');
  },

  removeUser: (): void => {
    storage.removeItem('user');
    storage.removeItem('authToken');
  },
};

// Loan applications
export const loanStorage = {
  saveLoanApplication: (loan: LoanApplication): void => {
    const loans = loanStorage.getLoanApplications();
    const updatedLoans = [...loans, loan];
    storage.setItem('loanApplications', updatedLoans);
  },

  getLoanApplications: (): LoanApplication[] => {
    return storage.getItem<LoanApplication[]>('loanApplications') || [];
  },

  updateLoanStatus: (loanId: string, status: LoanApplication['status']): void => {
    const loans = loanStorage.getLoanApplications();
    const updatedLoans = loans.map(loan => 
      loan.id === loanId ? { ...loan, status, updatedAt: new Date().toISOString() } : loan
    );
    storage.setItem('loanApplications', updatedLoans);
  },
};

// Notifications
export const notificationStorage = {
  saveNotification: (notification: Notification): void => {
    const notifications = notificationStorage.getNotifications();
    const updatedNotifications = [notification, ...notifications];
    storage.setItem('notifications', updatedNotifications);
  },

  getNotifications: (): Notification[] => {
    return storage.getItem<Notification[]>('notifications') || [];
  },

  markAsRead: (notificationId: string): void => {
    const notifications = notificationStorage.getNotifications();
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    storage.setItem('notifications', updatedNotifications);
  },
};