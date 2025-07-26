export interface AssetInfo {
  type: 'vehicle' | 'electronics' | 'jewelry' | 'furniture' | 'appliance' | 'other';
  requiresLicense: boolean;
  estimatedValue: 'low' | 'medium' | 'high';
  name: string;
}

// Mock AI/ML asset recognition - in real app this would use image recognition
export const analyzeAsset = async (imageUri: string): Promise<AssetInfo> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock asset detection based on random selection for demo
  const assets: AssetInfo[] = [
    { type: 'vehicle', requiresLicense: true, estimatedValue: 'high', name: 'Car' },
    { type: 'vehicle', requiresLicense: true, estimatedValue: 'medium', name: 'Motorcycle' },
    { type: 'electronics', requiresLicense: false, estimatedValue: 'medium', name: 'Television' },
    { type: 'electronics', requiresLicense: false, estimatedValue: 'low', name: 'Old Phone' },
    { type: 'jewelry', requiresLicense: false, estimatedValue: 'high', name: 'Gold Jewelry' },
    { type: 'furniture', requiresLicense: false, estimatedValue: 'low', name: 'Wooden Chair' },
    { type: 'appliance', requiresLicense: false, estimatedValue: 'medium', name: 'Refrigerator' },
    { type: 'other', requiresLicense: false, estimatedValue: 'low', name: 'Household Item' },
  ];
  
  return assets[Math.floor(Math.random() * assets.length)];
};

export const getAssetLicenseType = (assetType: string): string => {
  switch (assetType) {
    case 'vehicle':
      return 'Vehicle Registration/License';
    default:
      return 'Asset License';
  }
};

export const isLowValueAsset = (estimatedValue: string): boolean => {
  return estimatedValue === 'low';
};