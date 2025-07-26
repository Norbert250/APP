import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, LoanApplication, Notification } from '../types';

// Secure storage for sensitive data
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

// Regular storage for non-sensitive data
export const storage = {
  async setItem(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async getItem(key: string): Promise<any> {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

// User management
export const userStorage = {
  async saveUser(user: User): Promise<void> {
    await storage.setItem('user', user);
  },

  async getUser(): Promise<User | null> {
    return await storage.getItem('user');
  },

  async removeUser(): Promise<void> {
    await storage.removeItem('user');
    await secureStorage.removeItem('authToken');
  },
};

// Loan applications
export const loanStorage = {
  async saveLoanApplication(loan: LoanApplication): Promise<void> {
    const loans = await this.getLoanApplications();
    const updatedLoans = [...loans, loan];
    await storage.setItem('loanApplications', updatedLoans);
  },

  async getLoanApplications(): Promise<LoanApplication[]> {
    return (await storage.getItem('loanApplications')) || [];
  },

  async updateLoanStatus(loanId: string, status: LoanApplication['status']): Promise<void> {
    const loans = await this.getLoanApplications();
    const updatedLoans = loans.map(loan => 
      loan.id === loanId ? { ...loan, status, updatedAt: new Date().toISOString() } : loan
    );
    await storage.setItem('loanApplications', updatedLoans);
  },
};

// Notifications
export const notificationStorage = {
  async saveNotification(notification: Notification): Promise<void> {
    const notifications = await this.getNotifications();
    const updatedNotifications = [notification, ...notifications];
    await storage.setItem('notifications', updatedNotifications);
  },

  async getNotifications(): Promise<Notification[]> {
    return (await storage.getItem('notifications')) || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    const notifications = await this.getNotifications();
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    await storage.setItem('notifications', updatedNotifications);
  },
};