import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function HarvestTabScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <StatusBar style="light" />
      <ExpoLinearGradient
        colors={['#1B5E20', '#2E7D32', '#4CAF50']}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.icon}>📊</Text>
          <Text style={styles.title}>Harvest Insights</Text>
          <Text style={styles.subtitle}>Market Intelligence</Text>
        </View>
      </ExpoLinearGradient>
      
      <View style={styles.container}>
        <Card>
          <Text style={styles.cardTitle}>Optimize Your Harvest</Text>
          <Text style={styles.cardText}>
            Measure leaf size using a reference card for accurate harvest readiness assessment. 
            Get instant feedback on maturity, gel content, and market value.
          </Text>
          <Button
            title="Start Measurement"
            onPress={() => router.push('/harvest/card-capture-guide')}
            variant="gradient"
            style={styles.button}
            icon="📏"
          />
          
          <View style={styles.divider} />
          
          <Text style={styles.demoLabel}>🧪 Demo: AI-Based Assessment</Text>
          <Text style={styles.demoText}>
            Try experimental ML model (38% accuracy - for demo only)
          </Text>
          <Button
            title="Try ML Assessment"
            onPress={() => router.push('/harvest/ml-demo')}
            style={styles.mlButton}
            icon="🤖"
          />
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <Text style={styles.infoText}>• Place reference card near leaves</Text>
          <Text style={styles.infoText}>• Capture image with your camera</Text>
          <Text style={styles.infoText}>• Mark card corners for calibration</Text>
          <Text style={styles.infoText}>• Measure up to 3 leaves by tapping base & tip</Text>
          <Text style={styles.infoText}>• Get harvest readiness & market insights</Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  gradientHeader: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: '#546E7A',
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    marginVertical: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  demoLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  mlButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
  },
  infoCard: {
    marginTop: 16,
    backgroundColor: '#E8F5E9',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 15,
    color: '#1B5E20',
    marginBottom: 8,
    lineHeight: 22,
  },
});
