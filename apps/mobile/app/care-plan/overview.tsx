import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { listPlans } from '../../src/api/careplan';

export default function CarePlanOverviewScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listPlans()
      .then(res => setPlans(res.plans || []))
      .catch(e => setError(e.message || 'Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.wrapper}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#4CAF50']}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← AloeVeraMate</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Care Plan</Text>
          <View style={styles.taglineContainer}>
            <Text style={styles.subtitle}>Personalized Plant Care Management</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>💚 Smart Guidance</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Treatment Plans</Text>
          <Text style={styles.sectionSubtitle}>Active care schedules for your plants</Text>
        </View>

        {/* Active Treatment Plans Card */}
        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>📋</Text>
            </View>
            <View style={styles.moduleBadge}>
              <Text style={styles.moduleBadgeText}>Plans</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Your Active Treatment Plans</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : plans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🌱</Text>
              <Text style={styles.emptyStateText}>No active treatment plans yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create a plan after diagnosing your plant or chat with our AI assistant
              </Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {plans.map((plan, index) => (
                <TouchableOpacity 
                  key={plan.id} 
                  onPress={() => router.push(`/care-plan/plan/${plan.id}`)} 
                  style={[styles.planCard, index > 0 && styles.planCardMargin]}
                >
                  <View style={styles.planCardHeader}>
                    <View style={styles.planIconContainer}>
                      <Text style={styles.planIcon}>🌿</Text>
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>{plan.disease_name}</Text>
                      <Text style={styles.planMeta}>
                        Started: {new Date(plan.start_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.planArrow}>→</Text>
                  </View>
                  <View style={styles.planDetails}>
                    <View style={styles.planDetailItem}>
                      <Text style={styles.planDetailLabel}>Mode</Text>
                      <View style={styles.planDetailBadge}>
                        <Text style={styles.planDetailValue}>{plan.treatment_mode}</Text>
                      </View>
                    </View>
                    {plan.next_task_time && (
                      <View style={styles.planDetailItem}>
                        <Text style={styles.planDetailLabel}>Next Task</Text>
                        <Text style={styles.planDetailValue}>
                          {new Date(plan.next_task_time).toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Quick Actions Card */}
        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>⚡</Text>
            </View>
            <View style={styles.moduleBadge}>
              <Text style={styles.moduleBadgeText}>Actions</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Button
              title="Create Care Plan"
              onPress={() => router.push('/care-plan/create')}
              variant="gradient"
              style={styles.actionButton}
              icon="➕"
            />
            <Button
              title="Open Chatbot"
              onPress={() => router.push('/care-plan/chat/1')}
              variant="gradient"
              style={styles.actionButton}
              icon="💬"
            />
          </View>
        </Card>

        {/* Sample Care Plans Card */}
        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>📚</Text>
            </View>
            <View style={styles.moduleBadge}>
              <Text style={styles.moduleBadgeText}>Samples</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Sample Care Plans</Text>
          
          <View style={styles.samplePlan}>
            <View style={styles.samplePlanHeader}>
              <Text style={styles.samplePlanIcon}>🔬</Text>
              <View style={styles.samplePlanInfo}>
                <Text style={styles.samplePlanTitle}>Root Rot Treatment</Text>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationBadgeText}>7 days</Text>
                </View>
              </View>
            </View>
            <View style={styles.samplePlanContent}>
              <Text style={styles.samplePlanStep}>• Reduce watering frequency</Text>
              <Text style={styles.samplePlanStep}>• Improve drainage</Text>
              <Text style={styles.samplePlanStep}>• Apply fungicide treatment</Text>
              <Text style={styles.samplePlanStep}>• Monitor daily for 1 week</Text>
            </View>
          </View>

          <View style={styles.samplePlanDivider} />

          <View style={styles.samplePlan}>
            <View style={styles.samplePlanHeader}>
              <Text style={styles.samplePlanIcon}>🦠</Text>
              <View style={styles.samplePlanInfo}>
                <Text style={styles.samplePlanTitle}>Bacterial Soft Rot Care</Text>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationBadgeText}>14 days</Text>
                </View>
              </View>
            </View>
            <View style={styles.samplePlanContent}>
              <Text style={styles.samplePlanStep}>• Remove infected parts</Text>
              <Text style={styles.samplePlanStep}>• Apply copper-based spray</Text>
              <Text style={styles.samplePlanStep}>• Increase air circulation</Text>
              <Text style={styles.samplePlanStep}>• Weekly progress checks</Text>
            </View>
          </View>
        </Card>

        {/* AI Chatbot Promotion Card */}
        <Card style={styles.chatbotCard}>
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.chatbotGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.chatbotIcon}>🤖</Text>
            <Text style={styles.chatbotTitle}>AI Care Assistant</Text>
            <Text style={styles.chatbotDescription}>
              Get instant answers to your aloe vera care questions. Our AI provides personalized advice based on your plant's condition.
            </Text>
            <TouchableOpacity 
              style={styles.chatbotButton}
              onPress={() => router.push('/care-plan/chat/1')}
            >
              <Text style={styles.chatbotButtonText}>Chat with AI Assistant</Text>
              <Text style={styles.chatbotButtonIcon}>💬</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>🚀 Coming Soon</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoText}>✓ Custom care schedule builder</Text>
            <Text style={styles.infoText}>✓ Treatment progress tracking</Text>
          <Text style={styles.infoText}>✓ AI chatbot with plant knowledge</Text>
          <Text style={styles.infoText}>✓ Push notifications for care tasks</Text>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    gap: 8,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  taglineContainer: {
    marginTop: 4,
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E9',
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
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
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#78909C',
    fontWeight: '500',
  },
  moduleCard: {
    marginBottom: 20,
    padding: 24,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconText: {
    fontSize: 28,
  },
  moduleBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moduleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#78909C',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#E53935',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#546E7A',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  planCardMargin: {
    marginTop: 0,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  planIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planIcon: {
    fontSize: 24,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 2,
  },
  planMeta: {
    fontSize: 13,
    color: '#78909C',
  },
  planArrow: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: '600',
  },
  planDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  planDetailItem: {
    flex: 1,
  },
  planDetailLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  planDetailBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  planDetailValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    marginVertical: 0,
  },
  samplePlan: {
    marginBottom: 16,
  },
  samplePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  samplePlanIcon: {
    fontSize: 32,
  },
  samplePlanInfo: {
    flex: 1,
  },
  samplePlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 6,
  },
  durationBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  durationBadgeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '700',
  },
  samplePlanContent: {
    gap: 8,
  },
  samplePlanStep: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
  },
  samplePlanDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  chatbotCard: {
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
  },
  chatbotGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  chatbotIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  chatbotTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  chatbotDescription: {
    fontSize: 14,
    color: '#E8F5E9',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  chatbotButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatbotButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },
  chatbotButtonIcon: {
    fontSize: 18,
  },
  infoCard: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFD54F',
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F57F17',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#F57F17',
    lineHeight: 20,
    fontWeight: '500',
  },
});
