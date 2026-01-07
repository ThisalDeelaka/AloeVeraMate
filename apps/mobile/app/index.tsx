import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import Card from '../components/Card';

export default function HomeScreen() {
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
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo.jpeg')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.title}>Aloe Mate</Text>
          <View style={styles.taglineContainer}>
            <Text style={styles.subtitle}>AI-Powered Plant Health Assistant</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ Smart Detection</Text>
            </View>
          </View>
        </View>
      </ExpoLinearGradient>
      
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Diseases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>&lt;5s</Text>
            <Text style={styles.statLabel}>Analysis</Text>
          </View>
        </View>

      <Card style={styles.featureCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconBadgeText}>✨</Text>
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>What We Do</Text>
            <Text style={styles.cardSubtitle}>Advanced AI Technology</Text>
          </View>
        </View>
        <Text style={styles.cardText}>
          Our cutting-edge AI analyzes your aloe vera plants to detect diseases early. 
          Get personalized treatment plans combining modern science with traditional Ayurvedic wisdom.
        </Text>
      </Card>

      <Card style={styles.featureCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconBadgeText}>📸</Text>
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>How It Works</Text>
            <Text style={styles.cardSubtitle}>Simple 4-Step Process</Text>
          </View>
        </View>
        <View style={styles.stepContainer}>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Capture Photos</Text>
              <Text style={styles.stepDescription}>Take 3 clear images of your plant</Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>AI Analysis</Text>
              <Text style={styles.stepDescription}>Our model detects potential diseases</Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Instant Results</Text>
              <Text style={styles.stepDescription}>Get diagnosis with confidence score</Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Treatment Plan</Text>
              <Text style={styles.stepDescription}>Follow expert recommendations</Text>
            </View>
          </View>
        </View>
      </Card>

      <Button
        title="Start Disease Detection"
        onPress={() => router.push('/capture-guide')}
        variant="gradient"
        style={styles.mainButton}
        icon="🔍"
      />

      <Card style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Text style={styles.tipsIcon}>💡</Text>
          <Text style={styles.tipsTitle}>Pro Tips for Best Results</Text>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>Use bright, natural lighting</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>Focus clearly on affected areas</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>Capture multiple angles</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>Ensure clean camera lens</Text>
          </View>
        </View>
      </Card>
      </ScrollView>
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
    paddingBottom: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineContainer: {
    alignItems: 'center',
    gap: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#E8F5E9',
    textAlign: 'center',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78909C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureCard: {
    marginTop: 0,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeText: {
    fontSize: 24,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#66BB6A',
  },
  cardText: {
    fontSize: 15,
    color: '#546E7A',
    lineHeight: 24,
  },
  stepContainer: {
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#78909C',
    lineHeight: 20,
  },
  step: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  mainButton: {
    marginVertical: 10,
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
});
