import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import InputField from '@/components/InputField';
import { colors } from '@/utils/colors';
import { Payment, LoanApplication } from '@/types';
import { mockPayments, mockLoanApplications } from '@/utils/mockData';

interface PaymentScreenProps {
  navigation: any;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPayments(mockPayments);
    setLoans(mockLoanApplications);
  };

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

  const getPaymentStatusColor = (status: string, dueDate: string) => {
    if (status === 'paid') return colors.success;
    if (status === 'overdue') return colors.error;
    
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue <= 3) return colors.warning;
    return colors.primary;
  };

  const handlePayment = () => {
    if (!selectedPayment || !paymentAmount) {
      Alert.alert('Error', 'Please select a payment and enter amount');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay ${formatCurrency(parseFloat(paymentAmount))} using ${paymentMethod}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => {
            // Simulate payment processing
            Alert.alert('Success', 'Payment processed successfully!', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        }
      ]
    );
  };

  const upcomingPayments = payments.filter(p => p.status === 'pending');
  const overduePayments = payments.filter(p => p.status === 'overdue');

  return (
    <View style={styles.container}>
      <Header 
        title="Make Payment" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Overdue Payments */}
        {overduePayments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              Overdue Payments
            </Text>
            {overduePayments.map((payment) => (
              <TouchableOpacity
                key={payment.id}
                style={[
                  styles.paymentCard,
                  { borderLeftColor: colors.error },
                  selectedPayment?.id === payment.id && styles.selectedCard
                ]}
                onPress={() => {
                  setSelectedPayment(payment);
                  setPaymentAmount(payment.amount.toString());
                }}
              >
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${colors.error}20` }]}>
                    <Text style={[styles.statusText, { color: colors.error }]}>
                      OVERDUE
                    </Text>
                  </View>
                </View>
                <Text style={styles.paymentDate}>
                  Due: {formatDate(payment.dueDate)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Payments</Text>
          {upcomingPayments.map((payment) => {
            const daysUntilDue = getDaysUntilDue(payment.dueDate);
            const statusColor = getPaymentStatusColor(payment.status, payment.dueDate);
            
            return (
              <TouchableOpacity
                key={payment.id}
                style={[
                  styles.paymentCard,
                  { borderLeftColor: statusColor },
                  selectedPayment?.id === payment.id && styles.selectedCard
                ]}
                onPress={() => {
                  setSelectedPayment(payment);
                  setPaymentAmount(payment.amount.toString());
                }}
              >
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {daysUntilDue <= 0 ? 'DUE TODAY' : 
                       daysUntilDue === 1 ? 'DUE TOMORROW' : 
                       `${daysUntilDue} DAYS LEFT`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.paymentDate}>
                  Due: {formatDate(payment.dueDate)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Form */}
        {selectedPayment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            
            <InputField
              label="Payment Amount"
              value={paymentAmount}
              onChange={setPaymentAmount}
              placeholder="Enter amount"
              icon="cash"
              type="numeric"
              required
            />

            <View style={styles.paymentMethods}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              
              <TouchableOpacity
                style={[
                  styles.methodCard,
                  paymentMethod === 'card' && styles.selectedMethod
                ]}
                onPress={() => setPaymentMethod('card')}
              >
                <Ionicons name="card" size={24} color={colors.primary} />
                <Text style={styles.methodText}>Credit/Debit Card</Text>
                {paymentMethod === 'card' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodCard,
                  paymentMethod === 'bank' && styles.selectedMethod
                ]}
                onPress={() => setPaymentMethod('bank')}
              >
                <Ionicons name="business" size={24} color={colors.primary} />
                <Text style={styles.methodText}>Bank Transfer</Text>
                {paymentMethod === 'bank' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodCard,
                  paymentMethod === 'mobile' && styles.selectedMethod
                ]}
                onPress={() => setPaymentMethod('mobile')}
              >
                <Ionicons name="phone-portrait" size={24} color={colors.primary} />
                <Text style={styles.methodText}>Mobile Money</Text>
                {paymentMethod === 'mobile' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayment}
            >
              <Text style={styles.payButtonText}>
                Pay {formatCurrency(parseFloat(paymentAmount) || 0)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  paymentMethods: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  selectedMethod: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  methodText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;