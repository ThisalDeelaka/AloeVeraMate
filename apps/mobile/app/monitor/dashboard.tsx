import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function MonitorDashboardScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={styles.title}>IoT Dashboard</Text>
        <Text style={styles.subtitle}>Real-time Environmental Monitoring</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Connection Status Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📡</Text>
            <Text style={styles.cardTitle}>Device Connection</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, styles.offlineDot]} />
            <Text style={styles.statusText}>No device connected</Text>
          </View>
          <Button
            title="Connect IoT Device"
            onPress={() => {}}
            variant="gradient"
            style={styles.button}
            icon="🔗"
          />
        </Card>

        {/* Live Readings Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>Live Readings</Text>
          </View>
          <View style={styles.readingsGrid}>
            <View style={styles.readingCard}>
              <Text style={styles.readingLabel}>Temperature</Text>
              <Text style={styles.readingValue}>-- °C</Text>
            </View>
            <View style={styles.readingCard}>
              <Text style={styles.readingLabel}>Humidity</Text>
              <Text style={styles.readingValue}>-- %</Text>
            </View>
            <View style={styles.readingCard}>
              <Text style={styles.readingLabel}>Soil Moisture</Text>
              <Text style={styles.readingValue}>-- %</Text>
            </View>
            <View style={styles.readingCard}>
              <Text style={styles.readingLabel}>Light</Text>
              <Text style={styles.readingValue}>-- lux</Text>
            </View>
          </View>
          <Text style={styles.placeholderText}>
            Connect a device to view real-time sensor data
          </Text>
        </Card>

        {/* Disease Risk Status Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚠️</Text>
            <Text style={styles.cardTitle}>Disease Risk Status</Text>
          </View>
          <View style={styles.riskContainer}>
            <View style={[styles.riskBadge, styles.lowRisk]}>
              <Text style={styles.riskBadgeText}>Low Risk</Text>
            </View>
            <View style={[styles.riskBadge, styles.mediumRisk]}>
              <Text style={styles.riskBadgeText}>Medium Risk</Text>
            </View>
            <View style={[styles.riskBadge, styles.highRisk]}>
              <Text style={styles.riskBadgeText}>High Risk</Text>
            </View>
          </View>
          <Text style={styles.placeholderText}>
            Current risk level: -- (based on environmental conditions)
          </Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Coming Soon</Text>
          <Text style={styles.infoText}>• Real-time sensor data streaming</Text>
          <Text style={styles.infoText}>• Historical data charts</Text>
          <Text style={styles.infoText}>• Predictive disease risk alerts</Text>
          <Text style={styles.infoText}>• Automated care recommendations</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#78909C',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  sectionCard: {
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  offlineDot: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 15,
    color: '#546E7A',
    fontWeight: '500',
  },
  button: {
    marginVertical: 0,
  },
  readingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  readingCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  readingLabel: {
    fontSize: 12,
    color: '#78909C',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  readingValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B5E20',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  riskContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  riskBadge: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  lowRisk: {
    backgroundColor: '#C8E6C9',
  },
  mediumRisk: {
    backgroundColor: '#FFE082',
  },
  highRisk: {
    backgroundColor: '#FFCDD2',
  },
  riskBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
  infoCard: {
    marginTop: 16,
    backgroundColor: '#E8F5E9',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#1B5E20',
    marginBottom: 6,
    lineHeight: 22,
  },
});
