import React, { useState } from 'react';
import { 
  CreditCard, 
  Building, 
  Smartphone, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface Payment {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue';
}

const mockPayments: Payment[] = [
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
    dueDate: '2024-12-31',
    status: 'overdue',
  },
];

export default function PaymentPage() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const { addNotification } = useNotification();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePayment = () => {
    if (!selectedPayment || !paymentAmount) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a payment and enter amount'
      });
      return;
    }

    addNotification({
      type: 'success',
      title: 'Payment Successful',
      message: `Payment of ${formatCurrency(parseFloat(paymentAmount))} processed successfully!`
    });

    // Reset form
    setSelectedPayment(null);
    setPaymentAmount('');
  };

  const upcomingPayments = payments.filter(p => p.status === 'pending');
  const overduePayments = payments.filter(p => p.status === 'overdue');

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'bank', name: 'Bank Transfer', icon: Building },
    { id: 'mobile', name: 'Mobile Money', icon: Smartphone },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Make Payment</h1>

      {/* Overdue Payments */}
      {overduePayments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error-500" />
            <h2 className="text-lg font-semibold text-error-700">Overdue Payments</h2>
          </div>
          
          {overduePayments.map((payment, index) => (
            <div 
              key={payment.id}
              className={`card p-6 border-l-4 border-error-500 cursor-pointer transition-all duration-200 animate-slide-up ${
                selectedPayment?.id === payment.id ? 'ring-2 ring-error-500 bg-error-50' : 'hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => {
                setSelectedPayment(payment);
                setPaymentAmount(payment.amount.toString());
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {formatCurrency(payment.amount)}
                  </h3>
                  <p className="text-error-600 font-medium">
                    Overdue since {formatDate(payment.dueDate)}
                  </p>
                </div>
                <div className="bg-error-100 text-error-700 px-3 py-1 rounded-full text-sm font-medium">
                  OVERDUE
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Payments */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Payments</h2>
        
        {upcomingPayments.map((payment, index) => {
          const daysUntilDue = getDaysUntilDue(payment.dueDate);
          const isUrgent = daysUntilDue <= 3;
          
          return (
            <div 
              key={payment.id}
              className={`card p-6 border-l-4 cursor-pointer transition-all duration-200 animate-slide-up ${
                isUrgent ? 'border-warning-500' : 'border-primary-500'
              } ${
                selectedPayment?.id === payment.id 
                  ? 'ring-2 ring-primary-500 bg-primary-50' 
                  : 'hover:shadow-lg'
              }`}
              style={{ animationDelay: `${(index + overduePayments.length) * 0.1}s` }}
              onClick={() => {
                setSelectedPayment(payment);
                setPaymentAmount(payment.amount.toString());
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {formatCurrency(payment.amount)}
                  </h3>
                  <p className="text-gray-600">
                    Due: {formatDate(payment.dueDate)}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  daysUntilDue <= 0 
                    ? 'bg-error-100 text-error-700' 
                    : daysUntilDue === 1 
                    ? 'bg-warning-100 text-warning-700'
                    : daysUntilDue <= 3
                    ? 'bg-warning-100 text-warning-700'
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {daysUntilDue <= 0 ? 'DUE TODAY' : 
                   daysUntilDue === 1 ? 'DUE TOMORROW' : 
                   `${daysUntilDue} DAYS LEFT`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Form */}
      {selectedPayment && (
        <div className="card p-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Payment Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                      paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <method.icon className="w-6 h-6 text-primary-600" />
                      <span className="font-medium text-gray-900">{method.name}</span>
                      {paymentMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-success-500 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="btn-primary w-full"
            >
              Pay {formatCurrency(parseFloat(paymentAmount) || 0)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}