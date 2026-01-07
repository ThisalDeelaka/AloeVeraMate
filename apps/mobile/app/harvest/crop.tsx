import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  ActivityIndicator, 
  Alert,
  PanResponder,
  Animated,
  LayoutChangeEvent
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Line, Circle } from 'react-native-svg';
import Button from '../../components/Button';

const { width: screenWidth } = Dimensions.get('window');

interface Point {
  x: number;
  y: number;
}

interface ImageLayout {
  width: number;
  height: number;
  x: number;
  y: number;
}

export default function CropScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);
  
  // Initialize 4 corner points (as percentages of image dimensions)
  const [corners, setCorners] = useState<Point[]>([
    { x: 0.15, y: 0.15 }, // Top-left
    { x: 0.85, y: 0.15 }, // Top-right
    { x: 0.85, y: 0.85 }, // Bottom-right
    { x: 0.15, y: 0.85 }, // Bottom-left
  ]);

  const panResponders = useRef(
    corners.map((_, index) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {},
        onPanResponderMove: (_, gestureState) => {
          if (!imageLayout) return;

          const newX = corners[index].x + gestureState.dx / imageLayout.width;
          const newY = corners[index].y + gestureState.dy / imageLayout.height;

          // Clamp to image bounds
          const clampedX = Math.max(0, Math.min(1, newX));
          const clampedY = Math.max(0, Math.min(1, newY));

          const newCorners = [...corners];
          newCorners[index] = { x: clampedX, y: clampedY };
          setCorners(newCorners);
        },
        onPanResponderRelease: () => {},
      })
    )
  ).current;

  const handleImageLayout = (event: LayoutChangeEvent) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setImageLayout({ width, height, x, y });
  };

  const handleReset = () => {
    setCorners([
      { x: 0.15, y: 0.15 },
      { x: 0.85, y: 0.15 },
      { x: 0.85, y: 0.85 },
      { x: 0.15, y: 0.85 },
    ]);
  };

  const handleContinue = async () => {
    if (!imageUri || !imageLayout) {
      Alert.alert('Error', 'No image selected');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Convert corner percentages to actual pixel coordinates
      const pixelCorners = corners.map(corner => ({
        x: corner.x * imageLayout.width,
        y: corner.y * imageLayout.height
      }));
      
      // Navigate to calibration screen with crop coordinates
      router.push({
        pathname: '/harvest/card-calibrate',
        params: { 
          imageUri,
          cropCorners: JSON.stringify(pixelCorners)
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={handleRetake}
          style={styles.backButton}
        />
        <Text style={styles.title}>Crop Image</Text>
      </View>

      <View style={styles.content}>
        {imageUri ? (
          <View style={styles.imageWrapper}>
            <View style={styles.imageContainer} onLayout={handleImageLayout}>
              <Image
                source={{ uri: imageUri as string }}
                style={styles.image}
                resizeMode="contain"
              />
              
              {/* SVG Overlay for crop quadrilateral */}
              {imageLayout && (
                <Svg
                  style={StyleSheet.absoluteFill}
                  width={imageLayout.width}
                  height={imageLayout.height}
                >
                  {/* Draw lines connecting the corners */}
                  <Line
                    x1={corners[0].x * imageLayout.width}
                    y1={corners[0].y * imageLayout.height}
                    x2={corners[1].x * imageLayout.width}
                    y2={corners[1].y * imageLayout.height}
                    stroke="#4CAF50"
                    strokeWidth="2"
                  />
                  <Line
                    x1={corners[1].x * imageLayout.width}
                    y1={corners[1].y * imageLayout.height}
                    x2={corners[2].x * imageLayout.width}
                    y2={corners[2].y * imageLayout.height}
                    stroke="#4CAF50"
                    strokeWidth="2"
                  />
                  <Line
                    x1={corners[2].x * imageLayout.width}
                    y1={corners[2].y * imageLayout.height}
                    x2={corners[3].x * imageLayout.width}
                    y2={corners[3].y * imageLayout.height}
                    stroke="#4CAF50"
                    strokeWidth="2"
                  />
                  <Line
                    x1={corners[3].x * imageLayout.width}
                    y1={corners[3].y * imageLayout.height}
                    x2={corners[0].x * imageLayout.width}
                    y2={corners[0].y * imageLayout.height}
                    stroke="#4CAF50"
                    strokeWidth="2"
                  />
                  
                  {/* Draw corner points */}
                  {corners.map((corner, idx) => (
                    <Circle
                      key={idx}
                      cx={corner.x * imageLayout.width}
                      cy={corner.y * imageLayout.height}
                      r="8"
                      fill="#4CAF50"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  ))}
                </Svg>
              )}
              
              {/* Draggable corner handles */}
              {imageLayout && corners.map((corner, index) => (
                <Animated.View
                  key={index}
                  {...panResponders[index].panHandlers}
                  style={[
                    styles.cornerHandle,
                    {
                      left: corner.x * imageLayout.width - 20,
                      top: corner.y * imageLayout.height - 20,
                    }
                  ]}
                >
                  <View style={styles.handleInner} />
                </Animated.View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageIcon}>📷</Text>
            <Text style={styles.noImageText}>No image selected</Text>
          </View>
        )}

        <View style={styles.instructionCard}>
          <Text style={styles.instructionIcon}>✂️</Text>
          <Text style={styles.instructionTitle}>Adjust Crop Area</Text>
          <Text style={styles.instructionText}>
            Drag the corner points to select the area containing the aloe plant and reference card.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Reset"
          onPress={handleReset}
          style={styles.resetButton}
        />
        <Button
          title={isProcessing ? "Processing..." : "Continue"}
          onPress={handleContinue}
          variant="gradient"
          style={styles.continueButton}
          disabled={isProcessing || !imageUri}
          icon={isProcessing ? undefined : "→"}
        />
      </View>

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Processing crop area...</Text>
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
  imageWrapper: {
    width: '100%',
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
  cornerHandle: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  handleInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  noImageContainer: {
    width: '100%',
    height: screenWidth * 0.8,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noImageText: {
    fontSize: 16,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  instructionCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionIcon: {
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
    textAlign: 'center',
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
