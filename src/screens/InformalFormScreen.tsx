import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '@/components/Header';
import InputField from '@/components/InputField';
import UploadButton from '@/components/UploadButton';
import ProgressBar from '@/components/ProgressBar';
import { colors } from '@/utils/colors';
import { FormData } from '@/types';

const { width } = Dimensions.get('window');

interface InformalFormScreenProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onBack: () => void;
  onSubmit: () => void;
}

const InformalFormScreen: React.FC<InformalFormScreenProps> = ({ 
  formData, 
  setFormData, 
  onBack, 
  onSubmit 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    formData.repaymentDate ? new Date(formData.repaymentDate) : null
  );
  const pickImage = async (type: 'asset' | 'home' | 'shop' | 'illness') => {
    try {
      console.log(`Picking image for type: ${type}`);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Create a new uploaded file object
        const file = result.assets[0];
        const uploadedFile = {
          id: `${type}-${Date.now()}`,
          name: `${type}-photo.jpg`,
          uri: file.uri,
          type: file.mimeType || 'image/jpeg',
          size: file.fileSize
        };

        console.log(`Created uploadedFile with id: ${uploadedFile.id}`);

        // Update the form state with the new file
        setFormData(prev => {
          console.log(`Current uploadedAssets count: ${prev.uploadedAssets.length}`);
          if (type === 'illness') {
            return {
              ...prev,
              uploadedDocuments: [...prev.uploadedDocuments, uploadedFile]
            };
          }
          return {
            ...prev,
            uploadedAssets: [...prev.uploadedAssets, uploadedFile]
          };
        });

        Alert.alert('Success', `${type} photo uploaded successfully!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Informal Sector Loan Request" 
        showBack={true}
        onBack={onBack}
      />
      <ProgressBar currentStep={2} totalSteps={4} />
      
      <ScrollView contentContainerStyle={styles.formContent}>
        {/* Asset Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Asset Photos</Text>
          <Text style={styles.sectionSubtitle}>
            Upload 3-10 pictures of your most valuable assets
          </Text>
          
          <View style={styles.uploadGrid}>
            {[1, 2, 3, 4].map((i) => {
              // Get all assets with 'asset-' prefix
              const assetUploads = formData.uploadedAssets.filter(
                asset => asset.id.startsWith('asset-')
              );
              
              // Consider an asset uploaded if we have at least i assets
              const isUploaded = assetUploads.length >= i;
              
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.assetUploadBox,
                    isUploaded && { borderColor: colors.success, borderStyle: 'solid' }
                  ]}
                  onPress={() => pickImage('asset')}
                >
                  {isUploaded ? (
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  ) : (
                    <Ionicons name="camera" size={24} color={colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.uploadBoxText,
                    isUploaded && { color: colors.success }
                  ]}>
                    Asset {i} {isUploaded ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <UploadButton
            title="Upload Home Floor Photo"
            onPress={() => pickImage('home')}
            uploaded={formData.uploadedAssets.some(asset => asset.id.startsWith('home-'))}
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
            onPress={() => pickImage('illness')}
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
                onPress={() => pickImage('shop')}
                uploaded={formData.uploadedAssets.some(asset => asset.id.startsWith('shop-'))}
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
          style={[
            styles.submitButton,
            formData.uploadedAssets.filter(asset => asset.id.startsWith('asset-')).length < 3 && styles.disabledButton
          ]}
          onPress={() => {
            const assetCount = formData.uploadedAssets.filter(asset => asset.id.startsWith('asset-')).length;
            if (assetCount < 3) {
              Alert.alert('Validation Error', 'Please upload at least 3 asset photos before submitting.');
              return;
            }
            onSubmit();
          }}
          activeOpacity={0.8}
          disabled={formData.uploadedAssets.filter(asset => asset.id.startsWith('asset-')).length < 3}
        >
          <Text style={[
            styles.submitButtonText,
            formData.uploadedAssets.filter(asset => asset.id.startsWith('asset-')).length < 3 && styles.disabledButtonText
          ]}>Submit Loan Request</Text>
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
  uploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  assetUploadBox: {
    width: (width - 64) / 2,
    height: 100,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadBoxText: {
    fontSize: 14,
    color: colors.textSecondary,
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
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#D1D5DB',
  },
});

export default InformalFormScreen;