import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Button from '../../components/Button';
import Card from '../../components/Card';

type MaturityStage = 'NOT_MATURE' | 'INTERMEDIATE' | 'MATURE';
type ConfidenceStatus = 'HIGH' | 'MEDIUM' | 'LOW';

export default function ResultScreen() {
  const router = useRouter();
  const { imageUri, leafCount, avgLength, maxLength, minLength, measurements } = useLocalSearchParams();
  const [showConfidenceInfo, setShowConfidenceInfo] = useState(false);

  const avgLengthNum = parseFloat(avgLength as string);
  const leafCountNum = parseInt(leafCount as string);
  const leafLengths = measurements ? JSON.parse(measurements as string) : [];

  // Calculate maturity stage based on average leaf length
  const getMaturityStage = (avgLength: number): MaturityStage => {
    if (avgLength >= 25) return 'MATURE';
    if (avgLength >= 18) return 'INTERMEDIATE';
    return 'NOT_MATURE';
  };

  // Calculate confidence based on measurement consistency
  const getConfidenceStatus = (): ConfidenceStatus => {
    if (leafLengths.length === 0) return 'LOW';
    
    // Calculate standard deviation
    const mean = avgLengthNum;
    const variance = leafLengths.reduce((sum: number, length: number) => {
      return sum + Math.pow(length - mean, 2);
    }, 0) / leafLengths.length;
    const stdDev = Math.sqrt(variance);
    
    // High confidence: 3+ leaves, low variance
    if (leafLengths.length >= 3 && stdDev < 2) return 'HIGH';
    
    // Medium confidence: 2+ leaves or moderate variance
    if (leafLengths.length >= 2 && stdDev < 4) return 'MEDIUM';
    
    // Low confidence: 1 leaf or high variance
    return 'LOW';
  };

  const maturityStage = getMaturityStage(avgLengthNum);
  const confidenceStatus = getConfidenceStatus();

  const getMaturityDisplay = (stage: MaturityStage) => {
    switch (stage) {
      case 'MATURE':
        return {
          label: 'Mature',
          color: '#4CAF50',
          bgColor: '#C8E6C9',
          icon: '✅',
        };
      case 'INTERMEDIATE':
        return {
          label: 'Intermediate',
          color: '#FF9800',
          bgColor: '#FFE082',
          icon: '⏳',
        };
      case 'NOT_MATURE':
        return {
          label: 'Not Mature',
          color: '#F44336',
          bgColor: '#FFCDD2',
          icon: '❌',
        };
    }
  };

  const getConfidenceDisplay = (status: ConfidenceStatus) => {
    switch (status) {
      case 'HIGH':
        return {
          label: 'High Confidence',
          color: '#4CAF50',
          icon: '🎯',
        };
      case 'MEDIUM':
        return {
          label: 'Medium Confidence',
          color: '#FF9800',
          icon: '⚠️',
        };
      case 'LOW':
        return {
          label: 'Low Confidence',
          color: '#F44336',
          icon: '❗',
        };
    }
  };

  const maturityInfo = getMaturityDisplay(maturityStage);
  const confidenceInfo = getConfidenceDisplay(confidenceStatus);

  const showHarvestReadiness = maturityStage === 'MATURE' && 
    (confidenceStatus === 'HIGH' || confidenceStatus === 'MEDIUM');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ExpoLinearGradient
        colors={['#1B5E20', '#2E7D32', '#4CAF50']}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📊</Text>
          <Text style={styles.headerTitle}>Assessment Complete</Text>
          <Text style={styles.headerSubtitle}>Your harvest analysis is ready</Text>
        </View>
      </ExpoLinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Image Preview */}
        {imageUri && (
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: imageUri as string }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Average Length - Primary Metric */}
        <Card style={styles.primaryCard}>
          <Text style={styles.primaryLabel}>Average Leaf Length</Text>
          <Text style={styles.primaryValue}>{avgLength} cm</Text>
          <Text style={styles.primarySubtext}>Based on {leafCountNum} leaf measurement{leafCountNum > 1 ? 's' : ''}</Text>
        </Card>

        {/* Individual Leaf Measurements */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📏</Text>
            <Text style={styles.cardTitle}>Individual Measurements</Text>
          </View>
          <View style={styles.leafList}>
            {leafLengths.map((length: number, index: number) => (
              <View key={index} style={styles.leafItem}>
                <Text style={styles.leafLabel}>Leaf {index + 1}</Text>
                <Text style={styles.leafValue}>{length.toFixed(1)} cm</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Maturity Stage */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🌱</Text>
            <Text style={styles.cardTitle}>Maturity Stage</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: maturityInfo.bgColor }]}>
            <Text style={styles.statusIcon}>{maturityInfo.icon}</Text>
            <Text style={[styles.statusText, { color: maturityInfo.color }]}>
              {maturityInfo.label}
            </Text>
          </View>
        </Card>

        {/* Confidence Status */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>{confidenceInfo.icon}</Text>
            <Text style={styles.cardTitle}>Confidence Status</Text>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowConfidenceInfo(true)}
            >
              <Text style={styles.infoButtonText}>ℹ️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{confidenceInfo.label}</Text>
            <View style={[styles.confidenceBadge, { backgroundColor: confidenceInfo.color }]}>
              <Text style={styles.confidenceBadgeText}>
                {confidenceStatus}
              </Text>
            </View>
          </View>
        </Card>

        {/* Low Confidence - Retake Tips */}
        {confidenceStatus === 'LOW' && (
          <Card style={styles.warningCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>💡</Text>
              <Text style={styles.cardTitle}>Tips for Better Results</Text>
            </View>
            <Text style={styles.warningText}>
              For more accurate measurements, try these tips:
            </Text>
            <View style={styles.tipsList}>
              <View style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Ensure good lighting - avoid shadows</Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Keep reference card completely flat</Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Include full card in photo (all 4 corners visible)</Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Avoid tilting camera - keep parallel to plant</Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Measure multiple leaves (3 recommended)</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Harvest Readiness - Only show if MATURE and confidence MEDIUM/HIGH */}
        {showHarvestReadiness && (
          <>
            <Card style={styles.readinessCard}>
              <View style={styles.readinessHeader}>
                <Text style={styles.readinessIcon}>🎉</Text>
                <View>
                  <Text style={styles.readinessLabel}>Harvest Readiness</Text>
                  <Text style={styles.readinessStatus}>READY</Text>
                </View>
              </View>
              <Text style={styles.readinessMessage}>
                Your aloe vera leaves have reached optimal maturity! They are ready for harvest with excellent gel content expected.
              </Text>
            </Card>

            {/* Market Insights Placeholder */}
            <Card style={styles.marketCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>💰</Text>
                <Text style={styles.cardTitle}>Market Insights</Text>
              </View>
              <View style={styles.placeholderBox}>
                <Text style={styles.placeholderIcon}>📈</Text>
                <Text style={styles.placeholderText}>
                  Market pricing and revenue insights coming soon!
                </Text>
                <Text style={styles.placeholderSubtext}>
                  Integration with market data APIs in progress
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* Harvest Guidelines */}
        <Card style={styles.guidelinesCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.cardTitle}>Harvest Guidelines</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                {maturityStage === 'MATURE' 
                  ? 'Harvest outer leaves first, leaving inner leaves to continue growing'
                  : 'Wait for leaves to reach 25cm+ for optimal gel content'}
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Use a clean, sharp knife to cut at the base
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Best time: morning after watering the previous day
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Process leaves within 2-3 hours for maximum freshness
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Measure Again"
          onPress={() => router.push('/harvest/camera')}
          style={styles.measureButton}
        />
        <Button
          title="Done"
          onPress={() => router.push('/(tabs)/harvest')}
          variant="gradient"
          style={styles.doneButton}
          icon="✓"
        />
      </View>

      {/* Confidence Info Modal */}
      <Modal
        visible={showConfidenceInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfidenceInfo(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowConfidenceInfo(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Understanding Confidence</Text>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🎯 HIGH Confidence</Text>
              <Text style={styles.modalSectionText}>
                3+ leaves measured with consistent lengths (low variance). Results are highly reliable.
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>⚠️ MEDIUM Confidence</Text>
              <Text style={styles.modalSectionText}>
                2+ leaves measured or moderate length variation. Results are reasonably reliable.
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>❗ LOW Confidence</Text>
              <Text style={styles.modalSectionText}>
                Only 1 leaf measured or high variation between measurements. Consider measuring more leaves for better accuracy.
              </Text>
            </View>

            <Button
              title="Got it"
              onPress={() => setShowConfidenceInfo(false)}
              variant="gradient"
              style={styles.modalButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  primaryCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
  },
  primaryLabel: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 8,
  },
  primaryValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 8,
  },
  primarySubtext: {
    fontSize: 12,
    color: '#546E7A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    fontSize: 18,
  },
  leafList: {
    gap: 12,
  },
  leafItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  leafLabel: {
    fontSize: 14,
    color: '#546E7A',
    fontWeight: '600',
  },
  leafValue: {
    fontSize: 18,
    color: '#1B5E20',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 32,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#546E7A',
    fontWeight: '600',
  },
  confidenceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceBadgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  warningCard: {
    backgroundColor: '#FFF9C4',
    borderLeftWidth: 4,
    borderLeftColor: '#F57F17',
  },
  warningText: {
    fontSize: 14,
    color: '#827717',
    marginBottom: 12,
    fontWeight: '600',
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
    color: '#827717',
    fontWeight: '700',
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#827717',
    lineHeight: 20,
  },
  readinessCard: {
    backgroundColor: '#C8E6C9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  readinessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  readinessIcon: {
    fontSize: 40,
  },
  readinessLabel: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  readinessStatus: {
    fontSize: 24,
    color: '#1B5E20',
    fontWeight: '800',
  },
  readinessMessage: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
  },
  marketCard: {
    backgroundColor: '#E1F5FE',
  },
  placeholderBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B3E5FC',
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#0277BD',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#0288D1',
    textAlign: 'center',
  },
  guidelinesCard: {
    backgroundColor: '#E8F5E9',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  measureButton: {
    flex: 1,
  },
  doneButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  modalSectionText: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
  },
  modalButton: {
    width: '100%',
    marginTop: 8,
  },
});
