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
            Track harvest readiness and get real-time market price recommendations. 
            Maximize your profit with intelligent timing and market insights.
          </Text>
          <Button
            title="Check Harvest Status"
            onPress={() => router.push('/harvest/capture-guide')}
            variant="gradient"
            style={styles.button}
            icon="🌱"
          />
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>What You Get</Text>
          <Text style={styles.infoText}>• Harvest readiness detection</Text>
          <Text style={styles.infoText}>• Real-time market prices</Text>
          <Text style={styles.infoText}>• Quality assessment</Text>
          <Text style={styles.infoText}>• Revenue predictions</Text>
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
