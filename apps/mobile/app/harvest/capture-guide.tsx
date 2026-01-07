import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function HarvestCaptureGuideScreen() {
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
        <Text style={styles.title}>Harvest Assessment</Text>
        <Text style={styles.subtitle}>Check Your Plant's Harvest Readiness</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Instructions Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📸</Text>
            <Text style={styles.cardTitle}>Capture Instructions</Text>
          </View>
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>Photograph Full Plant</Text>
                <Text style={styles.instructionText}>
                  Take a clear photo showing the entire aloe vera plant from the side
                </Text>
              </View>
            </View>
            <View style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>Place Reference Card</Text>
                <Text style={styles.instructionText}>
                  Place a credit card or business card (85.6mm × 54mm) flat next to the leaves
                </Text>
              </View>
            </View>
            <View style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>Take One Photo</Text>
                <Text style={styles.instructionText}>
                  Capture one photo showing both the card and the leaves you want to measure
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* What We Assess Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🔍</Text>
            <Text style={styles.cardTitle}>What We Assess</Text>
          </View>
          <View style={styles.assessmentGrid}>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentIcon}>📏</Text>
              <Text style={styles.assessmentLabel}>Leaf Size & Thickness</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentIcon}>🎨</Text>
              <Text style={styles.assessmentLabel}>Color & Maturity</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentIcon}>💧</Text>
              <Text style={styles.assessmentLabel}>Gel Content</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentIcon}>⭐</Text>
              <Text style={styles.assessmentLabel}>Overall Quality</Text>
            </View>
          </View>
        </Card>

        {/* Camera Action Card */}
        <Card style={styles.actionCard}>
          <Text style={styles.actionTitle}>Ready to Start?</Text>
          <Text style={styles.actionText}>
            Our AI will analyze your photos to determine harvest readiness and provide market price estimates.
          </Text>
          <Button
            title="Open Camera"
            onPress={() => router.push('/harvest/camera')}
            variant="gradient"
            style={styles.button}
            icon="📷"
          />
        </Card>

        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💡</Text>
            <Text style={styles.cardTitle}>Pro Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>Harvest in the morning for best gel quality</Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>Choose outer leaves (3+ years old)</Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>Leaves should be thick and plump</Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>Check market prices before harvesting</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Coming Soon</Text>
          <Text style={styles.infoText}>• AI harvest readiness detection</Text>
          <Text style={styles.infoText}>• Real-time market price integration</Text>
          <Text style={styles.infoText}>• Quality grading system</Text>
          <Text style={styles.infoText}>• Revenue prediction calculator</Text>
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
  instructionsContainer: {
    gap: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
  },
  assessmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  assessmentItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  assessmentIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  assessmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#546E7A',
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    marginTop: 16,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 15,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    marginVertical: 0,
  },
  tipsCard: {
    backgroundColor: '#F5F5F5',
    marginTop: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipBullet: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
  },
  infoCard: {
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
