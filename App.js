import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormalFormScreen from './src/screens/FormalFormScreen';
import InformalFormScreen from './src/screens/InformalFormScreen';
import AuthScreen from './src/screens/AuthScreen';
import LoanHistoryScreen from './src/screens/LoanHistoryScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import { FormData } from './src/types';
import { userStorage } from './src/utils/storage';
import { colors } from './src/utils/colors';

// Create the navigation stack
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Initial form data
const initialFormData: FormData = {
  amount: '',
  repaymentDate: '',
  hasRetailBusiness: false,
  businessRegNumber: '',
  businessLocation: '',
  guarantor1: { name: '', id: '', contact: '' },
  guarantor2: { name: '', id: '', contact: '' },
  allowPermissions: false,
  uploadedAssets: [],
  uploadedDocuments: [],
};

// Bottom Tab Navigator
function TabNavigator({ onLogout }) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          position: 'absolute',
          bottom: 0,
        },
      })}
    >
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name="History">
        {(props) => <LoanHistoryScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Payments">
        {(props) => <PaymentScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Notifications">
        {(props) => <NotificationsScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
    </SafeAreaView>
  );
}

// HomeScreen Component
function HomeScreen({ navigation }) {
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const handleSectorSelect = (sector) => {
    setShowSectorModal(false);
    navigation.navigate('LoanForm', { sector });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loan Services</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications" size={24} color={colors.primary} />
          {unreadNotifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="card" size={40} color={colors.primary} />
          </View>
          <Text style={styles.welcomeTitle}>Welcome to Loan Services</Text>
          <Text style={styles.welcomeSubtitle}>
            Quick and reliable financial solutions for your needs
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowSectorModal(true)}
          >
            <Ionicons name="cash" size={24} color="white" />
            <Text style={styles.buttonText}>Request Loan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Payments')}
          >
            <Ionicons name="card" size={24} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Pay Loan</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.featureText}>Quick approval process</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.featureText}>Flexible repayment options</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.featureText}>Competitive interest rates</Text>
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={showSectorModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Sector</Text>
            <TouchableOpacity
              style={styles.sectorButton}
              onPress={() => handleSectorSelect('formal')}
            >
              <Ionicons name="business" size={24} color={colors.primary} />
              <Text style={styles.sectorButtonText}>Formal Sector</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sectorButton}
              onPress={() => handleSectorSelect('informal')}
            >
              <Ionicons name="storefront" size={24} color={colors.primary} />
              <Text style={styles.sectorButtonText}>Informal Sector</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSectorModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <StatusBar style="auto" />
    </View>
  );
}

// PendingScreen Component
function PendingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Status</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Ionicons name="time" size={40} color={colors.warning} />
          </View>
          <Text style={styles.statusTitle}>Application Pending</Text>
          <Text style={styles.statusDescription}>
            Your loan application is currently under review. We'll notify you once there's an update.
          </Text>
          
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Application ID:</Text>
            <Text style={styles.statusValue}>LN-2025-07-25</Text>
          </View>
          
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Submitted on:</Text>
            <Text style={styles.statusValue}>July 25, 2025</Text>
          </View>
          
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Estimated completion:</Text>
            <Text style={styles.statusValue}>Within 48 hours</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => Alert.alert('Support', 'Contact support at support@loanapp.com')}
        >
          <Ionicons name="help-circle" size={20} color="white" />
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

// LoanFormScreen Component
function LoanFormScreen({ route, navigation }) {
  const { sector } = route.params;
  const [formData, setFormData] = useState(initialFormData);

  const handleBack = () => navigation.goBack();
  
  const handleSubmit = () => {
    Alert.alert('Success', 'Loan application submitted successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('Pending') }
    ]);
  };

  if (sector === 'formal') {
    return (
      <FormalFormScreen
        formData={formData}
        setFormData={setFormData}
        onBack={handleBack}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <InformalFormScreen
      formData={formData}
      setFormData={setFormData}
      onBack={handleBack}
      onSubmit={handleSubmit}
    />
  );
}

// Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        if (isMounted) {
          console.error('Auth initialization error:', error);
        }
      }
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await userStorage.getUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Tabs"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Tabs">
            {(props) => <TabNavigator {...props} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="LoanForm" component={LoanFormScreen} />
          <Stack.Screen name="Pending" component={PendingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingVertical: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 30,
    paddingHorizontal: '5%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  supportButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    gap: 12,
  },
  sectorButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});