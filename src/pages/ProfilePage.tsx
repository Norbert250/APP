import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  CreditCard,
  HelpCircle,
  FileText,
  Settings,
  LogOut,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getCreditScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 750) return 'text-success-600';
    if (score >= 650) return 'text-warning-600';
    return 'text-error-600';
  };

  const getCreditScoreLabel = (score?: number) => {
    if (!score) return 'Not Available';
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    return 'Poor';
  };

  const menuItems = [
    { icon: CreditCard, label: 'Payment Methods', onClick: () => {} },
    { icon: Shield, label: 'Security', onClick: () => {} },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => {} },
    { icon: FileText, label: 'Terms & Privacy', onClick: () => {} },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* User Info */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <Phone className="w-4 h-4" />
              <span>{user?.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.kycStatus === 'verified' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="text-success-600 font-medium">Verified</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-warning-500" />
                  <span className="text-warning-600 font-medium">Pending Verification</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credit Score */}
      <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Score</h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getCreditScoreColor(user?.creditScore)}`}>
              {user?.creditScore || 'N/A'}
            </span>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-1">
              {getCreditScoreLabel(user?.creditScore)}
            </h4>
            <p className="text-gray-600">
              Your credit score affects loan approval and interest rates
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Biometric Login</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => setBiometricEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">{item.label}</span>
              <Settings className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-error-50 text-error-600 rounded-xl hover:bg-error-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}