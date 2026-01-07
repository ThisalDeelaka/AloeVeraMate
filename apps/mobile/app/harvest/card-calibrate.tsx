import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Line } from 'react-native-svg';
import Button from '../../components/Button';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.139:8000';

interface Corner {
  x: number;
  y: number;
}

type DetectionMode = 'loading' | 'auto-detected' | 'manual';

export default function CardCalibrateScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  const [mode, setMode] = useState<DetectionMode>('manual');
  const [corners, setCorners] = useState<Corner[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [detectionConfidence, setDetectionConfidence] = useState(0);

  useEffect(() => {
    if (imageUri && imageLayout.width > 0) {
      detectCard();
    }
  }, [imageUri, imageLayout.width]);

  const detectCard = async () => {
    try {
      setMode('loading');
      
      // Create form data for upload
      const formData = new FormData();
      
      // Fetch the image as blob
      const response = await fetch(imageUri as string);
      const blob = await response.blob();
      
      // Append image file
      formData.append('image', {
        uri: imageUri as string,
        type: 'image/jpeg',
        name: 'harvest.jpg',
      } as any);
      
      // Call backend detection endpoint
      const detectionResponse = await axios.post(
        `${API_BASE_URL}/api/v4/harvest/detect_card`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000,
        }
      );
      
      const { success, card_corners, confidence, message } = detectionResponse.data;
      
      if (success && card_corners && card_corners.length === 4) {
        // Auto-detection succeeded
        setCorners(card_corners);
        setDetectionConfidence(confidence || 0);
        setMode('auto-detected');
      } else {
        // Auto-detection failed, switch to manual mode
        setMode('manual');
        setCorners([]);
        Alert.alert('Manual Mode', message || 'Please tap the 4 corners of your reference card.');
      }
    } catch (error) {
      console.error('Card detection error:', error);
      // Fallback to manual mode
      setMode('manual');
      setCorners([]);
      Alert.alert('Manual Mode', 'Auto-detection unavailable. Please mark the 4 corners manually.');
    }
  };

  const handleImageLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setImageLayout({ width, height, x, y });
  };

  const handleImagePress = (event: any) => {
    if (mode !== 'manual') return;
    
    if (corners.length >= 4) {
      Alert.alert('Info', 'All 4 corners marked. Tap "Continue" or "Reset" to start over.');
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    
    const newCorner: Corner = {
      x: locationX,
      y: locationY,
    };
    
    setCorners([...corners, newCorner]);
  };

  const handleReset = () => {
    setCorners([]);
  };

  const handleConfirm = async () => {
    if (corners.length < 4) {
      Alert.alert('Not Ready', 'Please mark all 4 corners of the reference card.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate calibration processing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Navigate to leaf measurement screen with all data
      router.push({
        pathname: '/harvest/leaf-measure',
        params: {
          imageUri,
          cardCorners: JSON.stringify(corners),
        }
      });
    } catch (error) {
      console.error('Error confirming:', error);
      Alert.alert('Error', 'Failed to proceed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setCorners([]);
    setMode('manual');
  };

  const getCornerLabel = (index: number): string => {
    const labels = ['Top-Left', 'Top-Right', 'Bottom-Right', 'Bottom-Left'];
    return labels[index] || '';
  };

  const getInstructionText = (): string => {
    if (mode === 'loading') return 'Detecting reference card...';
    if (mode === 'auto-detected') return 'Card detected! Verify the corners are correct.';
    if (corners.length < 4) {
      return `Tap ${getCornerLabel(corners.length)} corner of the card (${corners.length + 1}/4)`;
    }
    return 'All corners marked! Review and continue.';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={styles.title}>Card Calibration</Text>
      </View>

      <View style={styles.content}>
        {/* Instruction Banner */}
        <View style={[
          styles.instructionBanner,
          mode === 'auto-detected' ? styles.bannerSuccess : 
          mode === 'loading' ? styles.bannerLoading : styles.bannerInfo
        ]}>
          <Text style={styles.bannerIcon}>
            {mode === 'loading' ? '🔍' : mode === 'auto-detected' ? '✅' : '👆'}
          </Text>
          <Text style={styles.bannerText}>{getInstructionText()}</Text>
          {mode === 'auto-detected' && (
            <Text style={styles.confidenceText}>
              {Math.round(detectionConfidence * 100)}% confidence
            </Text>
          )}
        </View>

        {/* Image with corner markers */}
        <View style={styles.imageWrapper}>
          <Text style={styles.zoomHint}>Pinch to zoom for precise corner placement</Text>
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <TouchableOpacity
              activeOpacity={mode === 'manual' ? 0.8 : 1}
              onPress={handleImagePress}
              disabled={mode !== 'manual'}
            >
              <View style={styles.imageContainer} onLayout={handleImageLayout}>
                <Image
                  source={{ uri: imageUri as string }}
                style={styles.image}
                resizeMode="contain"
              />
              
              {/* SVG overlay for corners and lines */}
              {imageLayout.width > 0 && corners.length > 0 && (
                <Svg
                  style={StyleSheet.absoluteFill}
                  width={imageLayout.width}
                  height={imageLayout.height}
                >
                  {/* Draw lines between corners */}
                  {corners.length >= 2 && (
                    <>
                      <Line
                        x1={corners[0].x}
                        y1={corners[0].y}
                        x2={corners[1].x}
                        y2={corners[1].y}
                        stroke="#4CAF50"
                        strokeWidth="2"
                      />
                    </>
                  )}
                  {corners.length >= 3 && (
                    <Line
                      x1={corners[1].x}
                      y1={corners[1].y}
                      x2={corners[2].x}
                      y2={corners[2].y}
                      stroke="#4CAF50"
                      strokeWidth="2"
                    />
                  )}
                  {corners.length >= 4 && (
                    <>
                      <Line
                        x1={corners[2].x}
                        y1={corners[2].y}
                        x2={corners[3].x}
                        y2={corners[3].y}
                        stroke="#4CAF50"
                        strokeWidth="2"
                      />
                      <Line
                        x1={corners[3].x}
                        y1={corners[3].y}
                        x2={corners[0].x}
                        y2={corners[0].y}
                        stroke="#4CAF50"
                        strokeWidth="2"
                      />
                    </>
                  )}
                  
                  {/* Draw corner markers */}
                  {corners.map((corner, index) => (
                    <Circle
                      key={index}
                      cx={corner.x}
                      cy={corner.y}
                      r="10"
                      fill="#4CAF50"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                    />
                  ))}
                </Svg>
              )}              
            </View>
          </TouchableOpacity>
          </ScrollView>
          
          {/* Corner labels */}
          {corners.length > 0 && imageLayout.width > 0 && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {corners.map((corner, index) => (
                <View
                  key={index}
                  style={[
                    styles.cornerLabel,
                    {
                      left: corner.x - 30,
                      top: corner.y - 40,
                    }
                  ]}
                >
                  <Text style={styles.cornerLabelText}>{index + 1}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Progress indicator for manual mode */}
        {mode === 'manual' && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Corners marked: {corners.length}/4
            </Text>
            <View style={styles.progressBar}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index < corners.length && styles.progressDotActive
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Tip card */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            {mode === 'manual' 
              ? 'Mark corners in order: Top-Left → Top-Right → Bottom-Right → Bottom-Left'
              : 'Green circles show detected card corners. Tap "Retry Manually" if incorrect.'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {mode === 'auto-detected' && (
          <Button
            title="Retry Manually"
            onPress={handleRetry}
            style={styles.retryButton}
          />
        )}
        {mode === 'manual' && corners.length > 0 && (
          <Button
            title="Reset"
            onPress={handleReset}
            style={styles.resetButton}
          />
        )}
        <Button
          title={isProcessing ? "Processing..." : mode === 'auto-detected' ? "Looks Good" : "Continue"}
          onPress={handleConfirm}
          variant="gradient"
          style={styles.continueButton}
          disabled={isProcessing || corners.length < 4 || mode === 'loading'}
          icon={isProcessing ? undefined : "→"}
        />
      </View>

      {/* Loading overlay */}
      {(mode === 'loading' || isProcessing) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>
              {mode === 'loading' ? 'Detecting card...' : 'Calibrating...'}
            </Text>
          </View>
        </View>
      )}
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  bannerInfo: {
    backgroundColor: '#E3F2FD',
  },
  bannerSuccess: {
    backgroundColor: '#E8F5E9',
  },
  bannerLoading: {
    backgroundColor: '#FFF3E0',
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1B5E20',
    lineHeight: 20,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  imageWrapper: {
    width: '100%',
    height: screenWidth * 1,
    position: 'relative',
  },
  zoomHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  scrollViewContent: {
    width: screenWidth - 40,
    height: screenWidth * 1,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cornerLabel: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#546E7A',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  tipCard: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#546E7A',
    lineHeight: 18,
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
  retryButton: {
    flex: 1,
  },
  resetButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '600',
  },
});
