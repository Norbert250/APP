import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField';
import { colors } from '../utils/colors';
import { userStorage, secureStorage } from '../utils/storage';
import { mockUser } from '../utils/mockData';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save user data and auth token
      await userStorage.saveUser(mockUser);
      await secureStorage.setItem('authToken', 'mock-jwt-token');

      Alert.alert(
        'Success',
        isLogin ? 'Login successful!' : 'Account created successfully!',
        [{ text: 'OK', onPress: onAuthSuccess }]
      );
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="card" size={60} color={colors.primary} />
          </View>
          <Text style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin 
              ? 'Sign in to access your loan services' 
              : 'Join us to get started with loan services'
            }
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <InputField
              label="Full Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="Enter your full name"
              icon="person"
              required
            />
          )}

          <InputField
            label="Email"
            value={formData.email}
            onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            placeholder="Enter your email"
            icon="mail"
            type="email-address"
            required
          />

          {!isLogin && (
            <InputField
              label="Phone Number"
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              placeholder="Enter your phone number"
              icon="call"
              type="phone-pad"
              required
            />
          )}

          <InputField
            label="Password"
            value={formData.password}
            onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
            placeholder="Enter your password"
            icon="lock-closed"
            required
          />

          {!isLogin && (
            <InputField
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              placeholder="Confirm your password"
              icon="lock-closed"
              required
            />
          )}

          <TouchableOpacity
            style={[styles.authButton, loading && styles.disabledButton]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"
              }
            </Text>
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotButtonText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  authButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  forgotButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default AuthScreen;