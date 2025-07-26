import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { colors } from '@/utils/colors';
import { User } from '@/types';
import { userStorage } from '@/utils/storage';
import { mockUser } from '@/utils/mockData';

interface ProfileScreenProps {
  navigation: any;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await userStorage.getUser();
      setUser(storedUser || mockUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(mockUser);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await userStorage.removeUser();
            onLogout();
          }
        }
      ]
    );
  };

  const getCreditScoreColor = (score?: number) => {
    if (!score) return colors.textSecondary;
    if (score >= 750) return colors.success;
    if (score >= 650) return colors.warning;
    return colors.error;
  };

  const getCreditScoreLabel = (score?: number) => {
    if (!score) return 'Not Available';
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    return 'Poor';
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Header title="Profile" showBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Profile" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info Section */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.kycBadge}>
                <Ionicons 
                  name={user.kycStatus === 'verified' ? 'checkmark-circle' : 'time'} 
                  size={16} 
                  color={user.kycStatus === 'verified' ? colors.success : colors.warning} 
                />
                <Text style={[
                  styles.kycText,
                  { color: user.kycStatus === 'verified' ? colors.success : colors.warning }
                ]}>
                  {user.kycStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Credit Score Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credit Score</Text>
          <View style={styles.creditScoreContainer}>
            <View style={styles.creditScoreCircle}>
              <Text style={[styles.creditScore, { color: getCreditScoreColor(user.creditScore) }]}>
                {user.creditScore || 'N/A'}
              </Text>
            </View>
            <View style={styles.creditScoreInfo}>
              <Text style={styles.creditScoreLabel}>
                {getCreditScoreLabel(user.creditScore)}
              </Text>
              <Text style={styles.creditScoreDescription}>
                Your credit score affects loan approval and interest rates
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color={colors.text} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notificationsEnabled ? 'white' : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="finger-print" size={20} color={colors.text} />
              <Text style={styles.settingLabel}>Biometric Login</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={biometricEnabled ? 'white' : colors.textSecondary}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card" size={20} color={colors.text} />
            <Text style={styles.menuLabel}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.text} />
            <Text style={styles.menuLabel}>Security</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle" size={20} color={colors.text} />
            <Text style={styles.menuLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text" size={20} color={colors.text} />
            <Text style={styles.menuLabel}>Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kycText: {
    fontSize: 14,
    fontWeight: '500',
  },
  creditScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  creditScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  creditScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  creditScoreInfo: {
    flex: 1,
  },
  creditScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  creditScoreDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.error}20`,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});

export default ProfileScreen;