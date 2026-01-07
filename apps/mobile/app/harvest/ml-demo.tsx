import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.139:8000';

export default function MLDemoScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to continue.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access to continue.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo.');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'leaf.jpg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/v4/harvest/assess_ml`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        Alert.alert('Error', data.detail || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return '#4CAF50';
      case 'Nearly Ready': return '#FF9800';
      default: return '#F44336';
    }
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
        <Text style={styles.title}>🤖 ML Assessment Demo</Text>
        <Text style={styles.subtitle}>Experimental Feature</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Demo Feature</Text>
            <Text style={styles.warningText}>
              This uses an experimental EfficientNetB0 model with 38% test accuracy. 
              For production use, please use the measurement-based method.
            </Text>
          </View>
        </View>

        {/* Image Selection */}
        {!selectedImage ? (
          <View style={styles.selectionContainer}>
            <Text style={styles.instructionText}>Select an image of your Aloe Vera leaf:</Text>
            <TouchableOpacity style={styles.pickButton} onPress={handlePickImage}>
              <Text style={styles.pickButtonIcon}>🖼️</Text>
              <Text style={styles.pickButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pickButton, styles.cameraButton]} onPress={handleTakePhoto}>
              <Text style={styles.pickButtonIcon}>📷</Text>
              <Text style={styles.pickButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <Button
              title="Change Image"
              onPress={() => {
                setSelectedImage(null);
                setResult(null);
              }}
              style={styles.changeButton}
            />
            {!result && (
              <Button
                title={loading ? "Analyzing..." : "Analyze with ML"}
                onPress={handleAnalyze}
                variant="gradient"
                disabled={loading}
                style={styles.analyzeButton}
              />
            )}
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Analyzing leaf maturity...</Text>
          </View>
        )}

        {/* Results */}
        {result && (
          <View style={styles.resultsContainer}>
            <View style={[styles.statusCard, { borderLeftColor: result.color }]}>
              <Text style={styles.resultTitle}>Assessment Result</Text>
              <Text style={[styles.statusText, { color: result.color }]}>
                {result.status}
              </Text>
              <Text style={styles.predictionText}>
                Predicted: {result.prediction}
              </Text>
              <Text style={styles.confidenceText}>
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </Text>
              <Text style={styles.messageText}>{result.message}</Text>
            </View>

            {/* Top Predictions */}
            {result.top_predictions && (
              <View style={styles.predictionsCard}>
                <Text style={styles.predictionsTitle}>Top Predictions</Text>
                {result.top_predictions.map((pred: any, index: number) => (
                  <View key={index} style={styles.predictionRow}>
                    <Text style={styles.predictionClass}>{pred.class}</Text>
                    <Text style={styles.predictionConf}>
                      {(pred.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.disclaimerText}>
              {result.warning}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FF9800',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F57C00',
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFF3E0',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#546E7A',
    lineHeight: 18,
  },
  selectionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#546E7A',
    marginBottom: 24,
    textAlign: 'center',
  },
  pickButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cameraButton: {
    borderColor: '#4CAF50',
  },
  pickButtonIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  changeButton: {
    marginBottom: 8,
    backgroundColor: '#9E9E9E',
  },
  analyzeButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#546E7A',
    marginTop: 12,
  },
  resultsContainer: {
    marginTop: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  predictionText: {
    fontSize: 16,
    color: '#546E7A',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
  },
  predictionsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  predictionClass: {
    fontSize: 14,
    color: '#546E7A',
  },
  predictionConf: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
