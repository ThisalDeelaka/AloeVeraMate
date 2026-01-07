import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Card from '../../components/Card';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/design-system';


export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <StatusBar style="light" />
      
      {/* Modern gradient header */}
      <ExpoLinearGradient
        colors={Colors.gradients.primary}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          {/* Floating logo with modern shadow */}
          <View style={styles.logoContainer}>
            <View style={styles.logoShadow}>
              <Image 
                source={require('../../assets/logo.jpeg')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
          </View>
          
          {/* Modern title with better typography */}
          <Text style={styles.title}>Aloe Mate</Text>
          
          {/* Redesigned tagline with pill badges */}
          <View style={styles.taglineContainer}>
            <Text style={styles.subtitle}>AI-Powered Plant Health Assistant</Text>
            <View style={styles.badgeGroup}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🤖 AI Detection</Text>
              </View>
              <View style={[styles.badge, styles.badgeSecondary]}>
                <Text style={styles.badgeText}>📡 IoT Monitoring</Text>
              </View>
            </View>
          </View>
        </View>
      </ExpoLinearGradient>
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern section header with icon */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Text style={styles.sectionIcon}>🌿</Text>
          </View>
          <Text style={styles.sectionTitle}>Your Plant Health Toolkit</Text>
          <Text style={styles.sectionSubtitle}>Everything you need for healthy aloe vera plants</Text>
        </View>

        <View style={styles.modulesGrid}>
          {/* Modern Module Card 1: Disease Detection */}
          <Pressable 
            onPress={() => router.push('/capture-guide')}
            style={({ pressed }) => [
              styles.modernCard,
              pressed && styles.cardPressed
            ]}
          >
            <ExpoLinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.modernIcon}>
                    <Text style={styles.modernIconText}>🔬</Text>
                  </View>
                  <View style={styles.aiChip}>
                    <View style={styles.aiDot} />
                    <Text style={styles.aiChipText}>AI Powered</Text>
                  </View>
                </View>
                
                <View style={styles.cardBody}>
                  <Text style={styles.modernTitle}>Disease Detection</Text>
                  <Text style={styles.modernSubtitle}>& Treatment</Text>
                  <Text style={styles.modernDescription}>
                    Instant AI-powered diagnosis with personalized treatment recommendations
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.cardAction}>Get Started</Text>
                  <Text style={styles.cardArrow}>→</Text>
                </View>
              </View>
            </ExpoLinearGradient>
          </Pressable>

          {/* Modern Module Card 2: IoT Monitoring */}
          <Pressable 
            onPress={() => router.push('/monitor/dashboard')}
            style={({ pressed }) => [
              styles.modernCard,
              pressed && styles.cardPressed
            ]}
          >
            <ExpoLinearGradient
              colors={['#00BCD4', '#26C6DA']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.modernIcon}>
                    <Text style={styles.modernIconText}>📡</Text>
                  </View>
                  <View style={[styles.aiChip, styles.iotChip]}>
                    <View style={[styles.aiDot, styles.iotDot]} />
                    <Text style={styles.aiChipText}>Live Data</Text>
                  </View>
                </View>
                
                <View style={styles.cardBody}>
                  <Text style={styles.modernTitle}>IoT Monitoring</Text>
                  <Text style={styles.modernSubtitle}>& Disease Risk</Text>
                  <Text style={styles.modernDescription}>
                    Real-time environmental tracking with predictive disease alerts
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.cardAction}>View Dashboard</Text>
                  <Text style={styles.cardArrow}>→</Text>
                </View>
              </View>
            </ExpoLinearGradient>
          </Pressable>

          {/* Modern Module Card 3: Care Plan + Chatbot */}
          <Pressable 
            onPress={() => router.push('/care-plan')}
            style={({ pressed }) => [
              styles.modernCard,
              pressed && styles.cardPressed
            ]}
          >
            <ExpoLinearGradient
              colors={['#9C27B0', '#BA68C8']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.modernIcon}>
                    <Text style={styles.modernIconText}>💬</Text>
                  </View>
                  <View style={[styles.aiChip, styles.chatChip]}>
                    <View style={[styles.aiDot, styles.chatDot]} />
                    <Text style={styles.aiChipText}>AI Assistant</Text>
                  </View>
                </View>
                
                <View style={styles.cardBody}>
                  <Text style={styles.modernTitle}>Care Plan</Text>
                  <Text style={styles.modernSubtitle}>& AI Assistant</Text>
                  <Text style={styles.modernDescription}>
                    Get expert advice and personalized care recommendations
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.cardAction}>Ask Questions</Text>
                  <Text style={styles.cardArrow}>→</Text>
                </View>
              </View>
            </ExpoLinearGradient>
          </Pressable>

          {/* Modern Module Card 4: Harvest Assessment */}
          <Pressable 
            onPress={() => router.push('/harvest')}
            style={({ pressed }) => [
              styles.modernCard,
              pressed && styles.cardPressed
            ]}
          >
            <ExpoLinearGradient
              colors={['#FF9800', '#FFB74D']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.modernIcon}>
                    <Text style={styles.modernIconText}>🌱</Text>
                  </View>
                  <View style={[styles.aiChip, styles.harvestChip]}>
                    <View style={[styles.aiDot, styles.harvestDot]} />
                    <Text style={styles.aiChipText}>Smart Tools</Text>
                  </View>
                </View>
                
                <View style={styles.cardBody}>
                  <Text style={styles.modernTitle}>Harvest Assessment</Text>
                  <Text style={styles.modernSubtitle}>& Growth Tracking</Text>
                  <Text style={styles.modernDescription}>
                    Determine optimal harvest time with precise measurements
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.cardAction}>Start Assessment</Text>
                  <Text style={styles.cardArrow}>→</Text>
                </View>
              </View>
            </ExpoLinearGradient>
          </Pressable>
        </View>

        {/* Quick Tips Section */}
        <Card style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Text style={styles.tipsIcon}>💡</Text>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>Use bright, natural lighting for photos</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>Check IoT sensors daily for alerts</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>Follow care schedules consistently</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>Monitor market trends weekly</Text>
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
    backgroundColor: Colors.neutral[50],
  },
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoShadow: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    ...Shadows.xl,
    backgroundColor: Colors.neutral.white,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
  },
  title: {
    fontSize: Typography.fontSize['5xl'],
    fontWeight: Typography.fontWeight.black,
    color: Colors.neutral.white,
    marginBottom: Spacing.sm,
    letterSpacing: Typography.letterSpacing.wide,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  taglineContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: Typography.letterSpacing.normal,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeSecondary: {
    backgroundColor: 'rgba(0,188,212,0.3)',
    borderColor: 'rgba(0,188,212,0.5)',
  },
  badgeText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: Typography.letterSpacing.wide,
  },
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Spacing['2xl'],
  },
  sectionHeader: {
    marginBottom: Spacing['2xl'],
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  sectionIcon: {
    fontSize: 32,
  },
  sectionTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary[900],
    marginBottom: Spacing.xs,
    textAlign: 'center',
    letterSpacing: Typography.letterSpacing.tight,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  modulesGrid: {
    gap: Spacing.base,
    marginBottom: Spacing['3xl'],
  },
  modernCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardGradient: {
    padding: Spacing.lg,
    minHeight: 200,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  modernIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernIconText: {
    fontSize: 36,
  },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
  },
  aiChipText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  modernTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.black,
    color: Colors.neutral.white,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.tight,
  },
  modernSubtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.md,
  },
  modernDescription: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    fontWeight: Typography.fontWeight.medium,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  cardAction: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.white,
    letterSpacing: Typography.letterSpacing.wide,
  },
  cardArrow: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.neutral.white,
    fontWeight: Typography.fontWeight.bold,
  },
  tipsCard: {
    marginTop: 0,
    marginBottom: Spacing['2xl'],
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
    gap: Spacing.md,
  },
  tipsIcon: {
    fontSize: 28,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[900],
    flex: 1,
  },
  tipsList: {
    gap: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tipBullet: {
    fontSize: 18,
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.bold,
  },
  tipText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
    flex: 1,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
});
