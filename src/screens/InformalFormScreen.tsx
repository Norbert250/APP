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
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { analyzeAsset, getAssetLicenseType, isLowValueAsset } from '../utils/assetValidation';
import Header from '../components/Header';
import InputField from '../components/InputField';
import UploadButton from '../components/UploadButton';

import { colors } from '../utils/colors';
import { FormData } from '../types';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingLicenseUpload, setPendingLicenseUpload] = useState<string | null>(null);

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
        const file = result.assets[0];
        
        if (type === 'asset') {
          setIsAnalyzing(true);
          try {
            // Analyze the asset
            const assetInfo = await analyzeAsset(file.uri);
            
            const uploadedFile = {
              id: `${type}-${Date.now()}`,
              name: `${type}-photo.jpg`,
              uri: file.uri,
              type: file.mimeType || 'image/jpeg',
              size: file.fileSize,
              assetInfo: {
                ...assetInfo,
                hasLicense: false
              }
            };

            // Update form data
            setFormData(prev => ({
              ...prev,
              uploadedAssets: [...prev.uploadedAssets, uploadedFile]
            }));

            // Check if asset requires license
            if (assetInfo.requiresLicense) {
              setPendingLicenseUpload(uploadedFile.id);
              Alert.alert(
                'License Required',
                `This ${assetInfo.name} requires a ${getAssetLicenseType(assetInfo.type)}. Please upload the license document.`,
                [
                  { text: 'Upload License', onPress: () => uploadLicense(uploadedFile.id) },
                  { text: 'Skip for now', style: 'cancel' }
                ]
              );
            }

            // Check if asset is low value
            if (isLowValueAsset(assetInfo.estimatedValue)) {
              Alert.alert(
                'Low Value Asset',
                `This ${assetInfo.name} appears to be of low value. Consider uploading a more valuable asset to improve your loan application.`,
                [{ text: 'OK' }]
              );
            } else {
              Alert.alert('Success', `${assetInfo.name} uploaded successfully!`);
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to analyze asset');
          } finally {
            setIsAnalyzing(false);
          }
        } else {
          // Handle non-asset uploads
          const uploadedFile = {
            id: `${type}-${Date.now()}`,
            name: `${type}-photo.jpg`,
            uri: file.uri,
            type: file.mimeType || 'image/jpeg',
            size: file.fileSize
          };

          setFormData(prev => {
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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const uploadLicense = async (assetId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        
        // Update the asset with license information
        setFormData(prev => ({
          ...prev,
          uploadedAssets: prev.uploadedAssets.map(asset => 
            asset.id === assetId 
              ? { 
                  ...asset, 
                  assetInfo: { 
                    ...asset.assetInfo!, 
                    hasLicense: true, 
                    licenseUri: file.uri 
                  } 
                }
              : asset
          )
        }));

        setPendingLicenseUpload(null);
        Alert.alert('Success', 'License uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload license');
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_SMS
        ];
        
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        const callLogGranted = granted[PermissionsAndroid.PERMISSIONS.READ_CALL_LOG] === PermissionsAndroid.RESULTS.GRANTED;
        const smsGranted = granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED;
        
        if (callLogGranted && smsGranted) {
          Alert.alert('Success', 'Permissions granted successfully!');
          return true;
        } else {
          Alert.alert('Permission Required', 'Both call log and message permissions are required for loan verification.');
          return false;
        }
      }
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to request permissions');
      return false;
    }
  };

  const checkLowValueAssets = () => {
    const assetUploads = formData.uploadedAssets.filter(asset => asset.id.startsWith('asset-'));
    const lowValueAssets = assetUploads.filter(asset => 
      asset.assetInfo && isLowValueAsset(asset.assetInfo.estimatedValue)
    );

    if (lowValueAssets.length > 0) {
      const assetNames = lowValueAssets.map(asset => asset.assetInfo?.name).join(', ');
      Alert.alert(
        'Low Value Assets Detected',
        `The following assets appear to be of low value: ${assetNames}. Consider replacing them with more valuable assets to improve your loan application.`,
        [
          { text: 'Continue Anyway', onPress: () => onSubmit() },
          { text: 'Review Assets', style: 'cancel' }
        ]
      );
    } else {
      onSubmit();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header 
        title="Informal Sector Loan Request" 
        showBack={true}
        onBack={onBack}
      />

      
      <ScrollView contentContainerStyle={styles.formContent}>
        {/* Asset Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Asset Photos</Text>
          <Text style={styles.sectionSubtitle}>
            Upload 3-10 pictures of your most valuable assets
          </Text>
          
          {isAnalyzing && (
            <View style={styles.analyzingContainer}>
              <Text style={styles.analyzingText}>Analyzing asset...</Text>
            </View>
          )}
          
          <View style={styles.uploadGrid}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => {
              const assetUploads = formData.uploadedAssets.filter(
                asset => asset.id.startsWith('asset-')
              );
              
              const isUploaded = assetUploads.length >= i;
              const currentAsset = assetUploads[i - 1];
              const needsLicense = currentAsset?.assetInfo?.requiresLicense && !currentAsset?.assetInfo?.hasLicense;
              const isLowValue = currentAsset?.assetInfo && isLowValueAsset(currentAsset.assetInfo.estimatedValue);
              const canUpload = assetUploads.length < 10;
              
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.assetUploadBox,
                    isUploaded && { borderColor: colors.success, borderStyle: 'solid' },
                    needsLicense && { borderColor: colors.warning, borderStyle: 'solid' },
                    isLowValue && { borderColor: colors.error, borderStyle: 'solid' },
                    !canUpload && !isUploaded && { opacity: 0.5 }
                  ]}
                  onPress={canUpload || isUploaded ? () => pickImage('asset') : undefined}
                  disabled={isAnalyzing || (!canUpload && !isUploaded)}
                >
                  {needsLicense ? (
                    <Ionicons name="document" size={20} color={colors.warning} />
                  ) : isLowValue ? (
                    <Ionicons name="warning" size={20} color={colors.error} />
                  ) : isUploaded ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  ) : (
                    <Ionicons name="camera" size={20} color={colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.uploadBoxText,
                    isUploaded && { color: colors.success },
                    needsLicense && { color: colors.warning },
                    isLowValue && { color: colors.error }
                  ]}>
                    {needsLicense ? 'License Required' : 
                     isLowValue ? 'Low Value' :
                     isUploaded ? `${currentAsset?.assetInfo?.name || 'Asset'} ✓` : 
                     `Asset ${i}${i <= 3 ? ' *' : ''}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <Text style={styles.uploadHint}>
            {formData.uploadedAssets.filter(asset => asset.id.startsWith('asset-')).length}/10 assets uploaded (minimum 3 required)
          </Text>

          {/* Asset Summary */}
          {formData.uploadedAssets.filter(asset => asset.id.startsWith('asset-')).length > 0 && (
            <View style={styles.assetSummary}>
              <Text style={styles.assetSummaryTitle}>Uploaded Assets:</Text>
              {formData.uploadedAssets
                .filter(asset => asset.id.startsWith('asset-'))
                .map((asset, index) => (
                  <View key={asset.id} style={styles.assetSummaryItem}>
                    <Text style={styles.assetSummaryText}>
                      {index + 1}. {asset.assetInfo?.name || 'Unknown Asset'}
                    </Text>
                    {asset.assetInfo?.requiresLicense && !asset.assetInfo?.hasLicense && (
                      <TouchableOpacity
                        style={styles.licenseButton}
                        onPress={() => uploadLicense(asset.id)}
                      >
                        <Text style={styles.licenseButtonText}>Upload License</Text>
                      </TouchableOpacity>
                    )}
                    {asset.assetInfo && isLowValueAsset(asset.assetInfo.estimatedValue) && (
                      <Text style={styles.lowValueWarning}>⚠️ Low Value</Text>
                    )}
                  </View>
                ))}
            </View>
          )}
          
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
              onValueChange={async (value) => {
                if (value) {
                  const granted = await requestPermissions();
                  if (granted) {
                    setFormData(prev => ({ ...prev, allowPermissions: true }));
                  }
                } else {
                  setFormData(prev => ({ ...prev, allowPermissions: false }));
                }
              }}
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
            checkLowValueAssets();
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
    </SafeAreaView>
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
    paddingHorizontal: '5%',
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    backgroundColor: colors.surface,
    paddingHorizontal: '5%',
    paddingVertical: 20,
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
    flex: 1,
    minWidth: 100,
    maxWidth: (width - 80) / 3,
    aspectRatio: 1,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
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
  analyzingContainer: {
    padding: 16,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzingText: {
    color: colors.primary,
    fontWeight: '500',
  },
  assetSummary: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  assetSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  assetSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  assetSummaryText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  licenseButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  licenseButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  lowValueWarning: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default InformalFormScreen;