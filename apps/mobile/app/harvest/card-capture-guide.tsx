import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function CardCaptureGuideScreen() {
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
        <Text style={styles.title}>Card-Based Leaf Measurement</Text>
        <Text style={styles.subtitle}>Accurate size measurement using reference card</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* What You'll Need Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.cardTitle}>What You'll Need</Text>
          </View>
          <View style={styles.itemContainer}>
            <View style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>A standard business card or credit card (85.6mm × 54mm)</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>Your aloe vera plant with visible leaves</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>Good natural lighting</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>Place card flat on the same plane as leaves</Text>
            </View>
          </View>
        </Card>

        {/* Step-by-Step Instructions */}
        <Card style={styles.sectionCard}>
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
                <Text style={styles.instructionTitle}>Position Reference Card</Text>
                <Text style={styles.instructionText}>
                  Place a standard card (credit card or business card) near the base of your aloe vera plant. 
                  Ensure it's on the same plane as the leaves you want to measure.
                </Text>
              </View>
            </View>

            <View style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>Frame Your Shot</Text>
                <Text style={styles.instructionText}>
                  Take a photo showing the reference card and 1-3 leaves you want to measure. 
                  Make sure the entire card and full leaves are visible.
                </Text>
              </View>
            </View>

            <View style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>Keep Camera Steady</Text>
                <Text style={styles.instructionText}>
                  Hold your phone parallel to the plant and card (avoid angles). 
                  Take the photo from directly above or at eye level.
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Pro Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💡</Text>
            <Text style={styles.cardTitle}>Pro Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>Use a clean, flat card with sharp corners</Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>Ensure good lighting - avoid shadows on the card</Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>Keep the card and leaves on the same level</Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>Avoid camera rotation - keep phone straight</Text>
            </View>
          </View>
        </Card>

        {/* Action Button */}
        <Card style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Ready to Start?</Text>
            <Text style={styles.actionText}>
              Make sure your card is positioned and you have good lighting
            </Text>
          </View>
          <Button
            title="Open Camera"
            onPress={() => router.push('/harvest/camera')}
            variant="gradient"
            style={styles.button}
            icon="📷"
          />
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <Text style={styles.infoText}>
            The app uses the known dimensions of a standard card (85.6mm × 54mm) to calculate 
            the real-world size of your aloe vera leaves. This helps determine harvest readiness 
            based on leaf length, which indicates maturity and gel content.
          </Text>
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
  itemContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bullet: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
    lineHeight: 22,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#546E7A',
    lineHeight: 22,
  },
  instructionsContainer: {
    gap: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 16,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
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
  tipsCard: {
    marginTop: 16,
    backgroundColor: '#E8F5E9',
  },
  tipsList: {
    gap: 10,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '700',
    lineHeight: 22,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 22,
  },
  actionCard: {
    marginTop: 16,
    alignItems: 'center',
  },
  actionContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
  },
  button: {
    marginVertical: 0,
    width: '100%',
  },
  infoCard: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: '#FFF9C4',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F57F17',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#827717',
    lineHeight: 22,
  },
});
