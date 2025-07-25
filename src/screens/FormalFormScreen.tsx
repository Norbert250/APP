import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '@/components/Header';
import InputField from '@/components/InputField';
import UploadButton from '@/components/UploadButton';
import ProgressBar from '@/components/ProgressBar';
import { colors } from '@/utils/colors';
import { FormData } from '@/types';

interface FormalFormScreenProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onBack: () => void;
  onSubmit: () => void;
}

const FormalFormScreen: React.FC<FormalFormScreenProps> = ({ 
  formData, 
  setFormData, 
  onBack, 
  onSubmit 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    formData.repaymentDate ? new Date(formData.repaymentDate) : null
  );
  const pickDocument = async (type: 'bank' | 'payslip' | 'illness' | 'shop') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        // Create a new uploaded file object
        const file = result.assets[0];
        const uploadedFile = {
          id: `${type}-${Date.now()}`,
          name: file.name || `${type}-document.${file.mimeType?.split('/')[1] || 'pdf'}`,
          uri: file.uri,
          type: file.mimeType || 'application/pdf',
          size: file.size
        };

        // Update the form state with the new file
        setFormData(prev => ({
          ...prev,
          uploadedDocuments: [...prev.uploadedDocuments, uploadedFile]
        }));

        Alert.alert('Success', `${type} document uploaded successfully!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Formal Sector Loan Request" 
        showBack={true}
        onBack={onBack}
      />
      <ProgressBar currentStep={2} totalSteps={4} />
      
      <ScrollView contentContainerStyle={styles.formContent}>
        {/* Document Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          <Text style={styles.sectionSubtitle}>
            Please upload the following documents for verification
          </Text>
          
          <UploadButton
            title="Upload 6 Months Bank Statements"
            onPress={() => pickDocument('bank')}
            uploaded={formData.uploadedDocuments.some(doc => doc.id.startsWith('bank-'))}
          />
          
          <UploadButton
            title="Upload 6 Months Salary Payslips"
            onPress={() => pickDocument('payslip')}
            uploaded={formData.uploadedDocuments.some(doc => doc.id.startsWith('payslip-'))}
          />
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>
                Allow access to messages and call logs
              </Text>
              <Text style={styles.toggleSubtext}>
                Used for verification purposes only
              </Text>
            </View>
            <Switch
              value={formData.allowPermissions}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, allowPermissions: value }))
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={formData.allowPermissions ? 'white' : colors.textSecondary}
            />
          </View>
        </View>

        {/* Loan Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          
          <InputField
            label="Amount Requested"
            value={formData.amount}
            onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
            placeholder="Enter amount"
            icon="cash"
            type="numeric"
            required
          />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Repayment Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => {
                // Show date picker
                setShowDatePicker(true);
              }}
            >
              <Ionicons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[
                styles.datePickerText,
                !formData.repaymentDate && styles.datePickerPlaceholder
              ]}>
                {formData.repaymentDate
                  ? new Date(formData.repaymentDate).toLocaleDateString()
                  : "Select date"}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date && event.type !== 'dismissed') {
                    setSelectedDate(date);
                    setFormData(prev => ({
                      ...prev,
                      repaymentDate: date.toISOString().split('T')[0]
                    }));
                  }
                }}
                minimumDate={new Date()}
              />
            )}
          </View>

          <UploadButton
            title="Upload Proof of Illness"
            onPress={() => pickDocument('illness')}
            uploaded={formData.uploadedDocuments.some(doc => doc.id.startsWith('illness-'))}
          />
        </View>

        {/* Business Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.toggleContainer}>
            <Text style={styles.businessToggleText}>
              Do you own a retail business?
            </Text>
            <Switch
              value={formData.hasRetailBusiness}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, hasRetailBusiness: value }))
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={formData.hasRetailBusiness ? 'white' : colors.textSecondary}
            />
          </View>

          {formData.hasRetailBusiness && (
            <View style={styles.businessFields}>
              <InputField
                label="Business Registration Number"
                value={formData.businessRegNumber}
                onChange={(value) => setFormData(prev => ({ ...prev, businessRegNumber: value }))}
                placeholder="Enter registration number"
                icon="business"
              />

              <InputField
                label="Business Location"
                value={formData.businessLocation}
                onChange={(value) => setFormData(prev => ({ ...prev, businessLocation: value }))}
                placeholder="Enter business address"
                icon="location"
              />

              <UploadButton
                title="Upload Shop Picture"
                onPress={() => pickDocument('shop')}
                uploaded={formData.uploadedDocuments.some(doc => doc.id.startsWith('shop-'))}
              />
            </View>
          )}
        </View>

        {/* Guarantors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guarantors</Text>
          
          {/* Guarantor 1 */}
          <View style={styles.guarantorSection}>
            <Text style={styles.guarantorTitle}>
              Guarantor 1
            </Text>
            <View style={styles.guarantorFields}>
              <InputField
                label="Full Name"
                value={formData.guarantor1.name}
                onChange={(value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    guarantor1: { ...prev.guarantor1, name: value }
                  }))
                }
                placeholder="Enter full name"
                icon="person"
                required
              />
              <InputField
                label="ID Number"
                value={formData.guarantor1.id}
                onChange={(value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    guarantor1: { ...prev.guarantor1, id: value }
                  }))
                }
                placeholder="Enter ID number"
                icon="card"
                required
              />
              <InputField
                label="Contact"
                value={formData.guarantor1.contact}
                onChange={(value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    guarantor1: { ...prev.guarantor1, contact: value }
                  }))
                }
                placeholder="Enter phone number"
                icon="call"
                type="phone-pad"
                required
              />
            </View>
          </View>

          {/* Guarantor 2 */}
          <View style={styles.guarantorSection}>
            <Text style={styles.guarantorTitle}>
              Guarantor 2
            </Text>
            <View style={styles.guarantorFields}>
              <InputField
                label="Full Name"
                value={formData.guarantor2.name}
                onChange={(value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    guarantor2: { ...prev.guarantor2, name: value }
                  }))
                }
                placeholder="Enter full name"
                icon="person"
                required
              />
              <InputField
                label="ID Number"
                value={formData.guarantor2.id}
                onChange={(value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    guarantor2: { ...prev.guarantor2, id: value }
                  }))
                }
                placeholder="Enter ID number"
                icon="card"
                required
              />
              <InputField
                label="Contact"
                value={formData.guarantor2.contact}
                onChange={(value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    guarantor2: { ...prev.guarantor2, contact: value }
                  }))
                }
                placeholder="Enter phone number"
                icon="call"
                type="phone-pad"
                required
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Loan Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  required: {
    color: colors.error,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  datePickerPlaceholder: {
    color: colors.textSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  toggleSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  businessToggleText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  businessFields: {
    gap: 16,
    marginTop: 16,
  },
  guarantorSection: {
    marginBottom: 24,
  },
  guarantorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  guarantorFields: {
    gap: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default FormalFormScreen;