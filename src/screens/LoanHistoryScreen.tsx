import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors } from '../utils/colors';
import { LoanApplication } from '../types';
import { loanStorage } from '../utils/storage';
import { mockLoanApplications } from '../utils/mockData';

interface LoanHistoryScreenProps {
  navigation: any;
}

const LoanHistoryScreen: React.FC<LoanHistoryScreenProps> = ({ navigation }) => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const storedLoans = await loanStorage.getLoanApplications();
      // Use mock data if no stored loans
      setLoans(storedLoans.length > 0 ? storedLoans : mockLoanApplications);
    } catch (error) {
      console.error('Error loading loans:', error);
      setLoans(mockLoanApplications);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoans();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      case 'pending': return colors.warning;
      case 'under_review': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'pending': return 'time';
      case 'under_review': return 'eye';
      default: return 'help-circle';
    }
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header 
        title="Loan History" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loans.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Loan Applications</Text>
            <Text style={styles.emptySubtitle}>
              You haven't submitted any loan applications yet.
            </Text>
            <TouchableOpacity
              style={styles.newLoanButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.newLoanButtonText}>Apply for Loan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loansList}>
            {loans.map((loan) => (
              <TouchableOpacity
                key={loan.id}
                style={styles.loanCard}
                onPress={() => navigation.navigate('LoanDetails', { loanId: loan.id })}
              >
                <View style={styles.loanHeader}>
                  <View style={styles.loanInfo}>
                    <Text style={styles.loanAmount}>
                      {formatCurrency(loan.amount)}
                    </Text>
                    <Text style={styles.loanDate}>
                      Applied on {formatDate(loan.submittedAt)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(loan.status)}20` }]}>
                    <Ionicons 
                      name={getStatusIcon(loan.status)} 
                      size={16} 
                      color={getStatusColor(loan.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(loan.status) }]}>
                      {loan.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.loanDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sector:</Text>
                    <Text style={styles.detailValue}>
                      {loan.sector === 'formal' ? 'Formal Sector' : 'Informal Sector'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Repayment Date:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(loan.repaymentDate)}
                    </Text>
                  </View>
                  {loan.interestRate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Interest Rate:</Text>
                      <Text style={styles.detailValue}>{loan.interestRate}%</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.loanFooter}>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  newLoanButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newLoanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loansList: {
    gap: 16,
  },
  loanCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loanInfo: {
    flex: 1,
  },
  loanAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  loanDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loanDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  loanFooter: {
    alignItems: 'flex-end',
  },
});

export default LoanHistoryScreen;