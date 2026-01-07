import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Line } from 'react-native-svg';
import Button from '../../components/Button';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.139:8000';

interface LeafPoint {
  x: number;
  y: number;
}

interface LeafMeasurement {
  points: LeafPoint[]; // 3-4 points along the leaf curve
}

interface MeasuredLeaf {
  points: LeafPoint[];
  length_cm: number;
  length_pixels: number;
}

export default function LeafMeasureScreen() {
  const router = useRouter();
  const { imageUri, cardCorners } = useLocalSearchParams();
  const [leafMeasurements, setLeafMeasurements] = useState<LeafMeasurement[]>([]);
  const [currentPoints, setCurrentPoints] = useState<LeafPoint[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState(1);
  const [lastTap, setLastTap] = useState<{time: number, x: number, y: number} | null>(null);

  const handleImageLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setImageLayout({ width, height, x, y });
  };

  const handleImagePress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const now = Date.now();
    
    // Check for double-tap (within 300ms and close proximity)
    if (lastTap && now - lastTap.time < 300) {
      const distance = Math.sqrt(
        Math.pow(locationX - lastTap.x, 2) + Math.pow(locationY - lastTap.y, 2)
      );
      
      if (distance < 50) {
        // Double-tap detected - find and remove nearest point
        handleRemoveNearestPoint(locationX, locationY);
        setLastTap(null);
        return;
      }
    }
    
    setLastTap({ time: now, x: locationX, y: locationY });
    
    // Check if we've reached max leaves
    if (leafMeasurements.length >= 3 && currentPoints.length === 0) {
      Alert.alert('Maximum Reached', 'You can measure up to 3 leaves. Tap "Calculate Maturity" to continue.');
      return;
    }
    
    const newPoint: LeafPoint = {
      x: locationX,
      y: locationY,
    };
    
    const updatedPoints = [...currentPoints, newPoint];
    setCurrentPoints(updatedPoints);

    // Need at least 3 points, max 4 points per leaf
    if (updatedPoints.length >= 4) {
      // Auto-complete with 4 points
      const measurement: LeafMeasurement = {
        points: updatedPoints,
      };
      
      setLeafMeasurements([...leafMeasurements, measurement]);
      setCurrentPoints([]);
    }
  };

  const handleCompleteLeaf = () => {
    if (currentPoints.length < 3) {
      Alert.alert('Not Enough Points', 'Please tap at least 3 points along the leaf (base, middle, tip).');
      return;
    }
    
    const measurement: LeafMeasurement = {
      points: currentPoints,
    };
    
    setLeafMeasurements([...leafMeasurements, measurement]);
    setCurrentPoints([]);
  };

  const handleAddAnother = () => {
    if (leafMeasurements.length >= 3) {
      Alert.alert('Maximum Reached', 'You can measure up to 3 leaves.');
      return;
    }
    // Just reset current points to allow adding another
    setCurrentPoints([]);
  };

  const handleRemoveLeaf = (index: number) => {
    const updatedMeasurements = leafMeasurements.filter((_, i) => i !== index);
    setLeafMeasurements(updatedMeasurements);
  };

  const handleRemoveNearestPoint = (tapX: number, tapY: number) => {
    // Find nearest point in currentPoints
    if (currentPoints.length > 0) {
      let nearestIndex = -1;
      let minDistance = Infinity;
      
      currentPoints.forEach((point, index) => {
        const distance = Math.sqrt(
          Math.pow(tapX - point.x, 2) + Math.pow(tapY - point.y, 2)
        );
        if (distance < minDistance && distance < 50) {
          minDistance = distance;
          nearestIndex = index;
        }
      });
      
      if (nearestIndex >= 0) {
        const updated = currentPoints.filter((_, i) => i !== nearestIndex);
        setCurrentPoints(updated);
        Alert.alert('Point Removed', `Removed point ${nearestIndex + 1}`);
      }
    }
  };

  const handleCalculateMaturity = async () => {
    if (leafMeasurements.length === 0) {
      Alert.alert('No Measurements', 'Please measure at least one leaf before continuing.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create form data
      const formData = new FormData();
      
      // Fetch image as blob
      const imageResponse = await fetch(imageUri as string);
      const blob = await imageResponse.blob();
      
      formData.append('image', {
        uri: imageUri as string,
        type: 'image/jpeg',
        name: 'harvest.jpg',
      } as any);
      
      formData.append('card_corners', cardCorners as string);
      formData.append('leaf_measurements', JSON.stringify(leafMeasurements));
      
      // Call backend to calculate lengths
      const response = await axios.post(
        `${API_BASE_URL}/api/v4/harvest/measure_length`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 15000,
        }
      );
      
      const { leaf_lengths_cm, avg_leaf_length_cm, stage, confidence_status, retake_message } = response.data;
      
      if (!leaf_lengths_cm || leaf_lengths_cm.length === 0) {
        throw new Error(retake_message || 'Failed to measure leaves');
      }
      
      // Navigate to results screen with backend data
      router.push({
        pathname: '/harvest/result',
        params: {
          imageUri,
          leafCount: leaf_lengths_cm.length,
          avgLength: avg_leaf_length_cm.toFixed(1),
          maxLength: Math.max(...leaf_lengths_cm).toFixed(1),
          minLength: Math.min(...leaf_lengths_cm).toFixed(1),
          measurements: JSON.stringify(leaf_lengths_cm),
          stage: stage,
          confidenceStatus: confidence_status,
          retakeMessage: retake_message || '',
        }
      });
    } catch (error: any) {
      console.error('Error calculating maturity:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to calculate maturity';
      Alert.alert('Calculation Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getInstructionText = (): string => {
    if (currentPoints.length === 0) {
      if (leafMeasurements.length === 0) {
        return 'Tap along the leaf curve: Start at BASE (3-4 points)';
      } else {
        return `Leaf ${leafMeasurements.length} complete! Add another or Calculate`;
      }
    } else if (currentPoints.length === 1) {
      return `Point 2/${3-4}: Tap MIDDLE of the leaf curve`;
    } else if (currentPoints.length === 2) {
      return `Point 3: Tap another point or TIP to finish (tap Complete)`;
    } else {
      return `Point 4: Tap TIP or tap Complete (${currentPoints.length} points)`;
    }
  };

  const getAllPoints = () => {
    const allPoints: LeafPoint[] = [];
    leafMeasurements.forEach(measurement => {
      allPoints.push(...measurement.points);
    });
    return [...allPoints, ...currentPoints];
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {/* Instruction Banner */}
        <View style={styles.instructionBanner}>
          <Text style={styles.bannerIcon}>📏</Text>
          <Text style={styles.bannerText}>{getInstructionText()}</Text>
        </View>

        {/* Image with measurement overlay */}
        <View style={styles.imageWrapper}>
          <Text style={styles.zoomHint}>Pinch to zoom • Double-tap point to remove</Text>
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleImagePress}
              disabled={isProcessing}
            >
              <View style={styles.imageContainer} onLayout={handleImageLayout}>
                <Image
                  source={{ uri: imageUri as string }}
                  style={styles.image}
                  resizeMode="contain"
                />
              
              {/* SVG overlay for points and lines */}
              {imageLayout.width > 0 && (
                <Svg
                  style={StyleSheet.absoluteFill}
                  width={imageLayout.width}
                  height={imageLayout.height}
                >
                  {/* Draw completed measurements */}
                  {leafMeasurements.map((measurement, index) => (
                    <React.Fragment key={`leaf-${index}`}>
                      {/* Draw lines between consecutive points */}
                      {measurement.points.map((point, pointIndex) => {
                        if (pointIndex < measurement.points.length - 1) {
                          const nextPoint = measurement.points[pointIndex + 1];
                          return (
                            <Line
                              key={`line-${index}-${pointIndex}`}
                              x1={point.x}
                              y1={point.y}
                              x2={nextPoint.x}
                              y2={nextPoint.y}
                              stroke="#4CAF50"
                              strokeWidth="3"
                            />
                          );
                        }
                        return null;
                      })}
                      {/* Draw circles at each point */}
                      {measurement.points.map((point, pointIndex) => (
                        <Circle
                          key={`point-${index}-${pointIndex}`}
                          cx={point.x}
                          cy={point.y}
                          r="8"
                          fill={pointIndex === 0 ? "#4CAF50" : pointIndex === measurement.points.length - 1 ? "#2196F3" : "#FFC107"}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                      ))}
                    </React.Fragment>
                  ))}
                  
                  {/* Draw current in-progress points and lines */}
                  {currentPoints.map((point, index) => {
                    const fragments = [];
                    // Draw line from previous point
                    if (index > 0) {
                      fragments.push(
                        <Line
                          key={`current-line-${index}`}
                          x1={currentPoints[index - 1].x}
                          y1={currentPoints[index - 1].y}
                          x2={point.x}
                          y2={point.y}
                          stroke="#FF9800"
                          strokeWidth="3"
                          strokeDasharray="5,5"
                        />
                      );
                    }
                    // Draw point
                    fragments.push(
                      <Circle
                        key={`current-point-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r="8"
                        fill={index === 0 ? "#4CAF50" : "#FF9800"}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    );
                    return fragments;
                  })}
                </Svg>
              )}
            </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Base point (start of leaf)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>Middle points (curve)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Tip point (end of leaf)</Text>
          </View>
        </View>

        {/* Measurements List */}
        {leafMeasurements.length > 0 && (
          <View style={styles.measurementsCard}>
            <Text style={styles.measurementsTitle}>
              Measurements ({leafMeasurements.length}/3)
            </Text>
            {leafMeasurements.map((_, index) => (
              <View key={index} style={styles.measurementItem}>
                <View style={styles.measurementInfo}>
                  <Text style={styles.measurementIcon}>✓</Text>
                  <Text style={styles.measurementText}>Leaf {index + 1} complete</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveLeaf(index)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Progress indicator */}
        {currentPoints.length > 0 && (
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              {currentPoints.length} point(s) marked for Leaf {leafMeasurements.length + 1}
            </Text>
            <Text style={styles.progressSubtext}>
              {currentPoints.length >= 3 ? 'Tap Complete or add more points (max 4)' : `Need at least ${3 - currentPoints.length} more point(s)`}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {currentPoints.length >= 3 && (
          <Button
            title={`Complete Leaf ${leafMeasurements.length + 1} (${currentPoints.length} points)`}
            onPress={handleCompleteLeaf}
            style={styles.completeButton}
            variant="primary"
          />
        )}
        {leafMeasurements.length > 0 && leafMeasurements.length < 3 && currentPoints.length === 0 && (
          <Button
            title="Add Another Leaf"
            onPress={handleAddAnother}
            style={styles.addButton}
          />
        )}
        <Button
          title={isProcessing ? "Calculating..." : "Calculate Maturity"}
          onPress={handleCalculateMaturity}
          variant="gradient"
          style={styles.calculateButton}
          disabled={isProcessing || leafMeasurements.length === 0}
          icon={isProcessing ? undefined : "→"}
        />
      </View>

      {/* Loading overlay */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Calculating leaf lengths...</Text>
            <Text style={styles.loadingSubtext}>Using card calibration</Text>
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
    gap: 12,
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
  imageWrapper: {
    width: '100%',
    height: screenWidth * 1,
    marginBottom: 16,
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
  legendCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  legendText: {
    fontSize: 14,
    color: '#546E7A',
  },
  measurementsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  measurementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  measurementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  measurementIcon: {
    fontSize: 18,
    color: '#4CAF50',
  },
  measurementText: {
    fontSize: 14,
    color: '#546E7A',
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },
  removeButtonText: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  completeButton: {
    width: '100%',
  },
  addButton: {
    width: '100%',
  },
  calculateButton: {
    width: '100%',
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
  loadingSubtext: {
    fontSize: 14,
    color: '#546E7A',
  },
});
