import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import api, { getApiConfig } from '../src/utils/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

export default function DebugScreen() {
  const router = useRouter();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const config = getApiConfig();

  const updateTest = (name: string, update: Partial<TestResult>) => {
    setTests(prev => prev.map(t => t.name === name ? { ...t, ...update } : t));
  };

  const runTests = async () => {
    setIsRunning(true);
    
    const initialTests: TestResult[] = [
      { name: 'API Configuration', status: 'pending', message: 'Checking...' },
      { name: 'Backend Connectivity', status: 'pending', message: 'Checking...' },
      { name: 'Health Endpoint', status: 'pending', message: 'Checking...' },
      { name: 'Auth Endpoint', status: 'pending', message: 'Checking...' },
    ];
    
    setTests(initialTests);

    // Test 1: API Configuration
    try {
      const configUrl = config.backendUrl;
      if (configUrl && configUrl.length > 0) {
        updateTest('API Configuration', {
          status: 'success',
          message: `URL: ${configUrl}`,
        });
      } else {
        updateTest('API Configuration', {
          status: 'error',
          message: 'No backend URL configured!',
        });
      }
    } catch (error: any) {
      updateTest('API Configuration', {
        status: 'error',
        message: error.message,
      });
    }

    // Test 2: Backend Connectivity (simple fetch)
    const startTime = Date.now();
    try {
      const response = await fetch(`${config.backendUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        updateTest('Backend Connectivity', {
          status: 'success',
          message: `Connected (${duration}ms)`,
          duration,
        });
      } else {
        updateTest('Backend Connectivity', {
          status: 'error',
          message: `HTTP ${response.status}`,
          duration,
        });
      }
    } catch (error: any) {
      updateTest('Backend Connectivity', {
        status: 'error',
        message: error.message || 'Network request failed',
        duration: Date.now() - startTime,
      });
    }

    // Test 3: Health Endpoint via Axios
    const healthStart = Date.now();
    try {
      const response = await api.get('/api/health');
      const duration = Date.now() - healthStart;
      
      updateTest('Health Endpoint', {
        status: 'success',
        message: `OK - HF: ${response.data.huggingface_configured ? 'Yes' : 'No'} (${duration}ms)`,
        duration,
      });
    } catch (error: any) {
      updateTest('Health Endpoint', {
        status: 'error',
        message: error.message || 'Request failed',
        duration: Date.now() - healthStart,
      });
    }

    // Test 4: Auth endpoint (should return 422 without body)
    const authStart = Date.now();
    try {
      await api.post('/api/auth/login', {});
      updateTest('Auth Endpoint', {
        status: 'success',
        message: 'Reachable',
        duration: Date.now() - authStart,
      });
    } catch (error: any) {
      const duration = Date.now() - authStart;
      // 422 means endpoint is reachable but validation failed (expected)
      if (error.response?.status === 422 || error.response?.status === 400) {
        updateTest('Auth Endpoint', {
          status: 'success',
          message: `Reachable (validation error as expected) (${duration}ms)`,
          duration,
        });
      } else if (error.response) {
        updateTest('Auth Endpoint', {
          status: 'success',
          message: `Reachable (HTTP ${error.response.status}) (${duration}ms)`,
          duration,
        });
      } else {
        updateTest('Auth Endpoint', {
          status: 'error',
          message: error.message || 'Network error',
          duration,
        });
      }
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      default: return '○';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Network Debug</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Configuration Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Backend URL:</Text>
            <Text style={styles.configValue}>{config.backendUrl || 'NOT SET'}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Platform:</Text>
            <Text style={styles.configValue}>{Platform.OS} ({Platform.Version})</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Expo Go:</Text>
            <Text style={styles.configValue}>{config.isExpoGo ? 'Yes' : 'No (Standalone)'}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>App Version:</Text>
            <Text style={styles.configValue}>{Constants.expoConfig?.version || 'Unknown'}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Extra Config:</Text>
            <Text style={styles.configValue}>
              {Constants.expoConfig?.extra ? JSON.stringify(Constants.expoConfig.extra, null, 2) : 'None'}
            </Text>
          </View>
        </View>

        {/* Test Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connectivity Tests</Text>
            <TouchableOpacity 
              onPress={runTests} 
              style={styles.refreshButton}
              disabled={isRunning}
            >
              {isRunning ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <Text style={styles.refreshButtonText}>↻ Rerun</Text>
              )}
            </TouchableOpacity>
          </View>

          {tests.map((test, index) => (
            <View key={index} style={styles.testItem}>
              <View style={styles.testHeader}>
                <Text style={[styles.testStatus, { color: getStatusColor(test.status) }]}>
                  {getStatusIcon(test.status)}
                </Text>
                <Text style={styles.testName}>{test.name}</Text>
              </View>
              <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
                {test.message}
              </Text>
            </View>
          ))}
        </View>

        {/* Troubleshooting Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troubleshooting</Text>
          <Text style={styles.tip}>
            • If using HTTP (not HTTPS), ensure usesCleartextTraffic is enabled in app.config.js
          </Text>
          <Text style={styles.tip}>
            • For standalone APKs, environment variables must be set in app.config.js extra section
          </Text>
          <Text style={styles.tip}>
            • Check that the backend URL is accessible from your device's network
          </Text>
          <Text style={styles.tip}>
            • Verify CORS is properly configured on the backend
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#6366F1',
    fontSize: 16,
  },
  title: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    color: '#6366F1',
    fontSize: 14,
  },
  configItem: {
    marginBottom: 8,
  },
  configLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 2,
  },
  configValue: {
    color: '#F1F5F9',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  testItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  testName: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '500',
  },
  testMessage: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 24,
  },
  tip: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18,
  },
});
