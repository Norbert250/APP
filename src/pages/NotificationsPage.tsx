import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle,
  BellOff
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

const mockNotifications: Notification[] = [
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
  {
    id: 'notif-4',
    title: 'Application Rejected',
    message: 'Unfortunately, your recent loan application has been rejected. Please contact support for more details.',
    type: 'error',
    read: true,
    createdAt: '2024-12-05T09:15:00Z',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success-100 text-success-600 border-success-200';
      case 'warning': return 'bg-warning-100 text-warning-600 border-warning-200';
      case 'error': return 'bg-error-100 text-error-600 border-error-200';
      default: return 'bg-primary-100 text-primary-600 border-primary-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 mt-1">{unreadCount} unread notifications</p>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary text-sm py-2 px-4"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h2>
          <p className="text-gray-600">
            You're all caught up! We'll notify you when there are updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div 
              key={notification.id}
              className={`card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg animate-slide-up ${
                !notification.read ? 'border-l-4 border-primary-500 bg-primary-50/30' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full border ${getTypeColors(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-semibold text-gray-900 mb-1 ${
                        !notification.read ? 'font-bold' : ''
                      }`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="inline-block w-2 h-2 bg-primary-500 rounded-full ml-2" />
                        )}
                      </h3>
                      <p className="text-gray-600 mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}