import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button';

export default function HarvestCameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to capture images of your aloe vera plant with the reference card.
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            variant="gradient"
            style={styles.permissionButton}
          />
          <Button
            title="← Back"
            onPress={() => router.back()}
            style={styles.backButtonAlt}
          />
        </View>
      </View>
    );
  }

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;
    
    try {
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1, // High resolution
        base64: false,
        exif: false,
      });
      
      // Show preview
      setCapturedPhoto(photo.uri);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleNext = () => {
    if (capturedPhoto) {
      router.push({
        pathname: '/harvest/card-calibrate',
        params: { imageUri: capturedPhoto }
      });
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        router.push({
          pathname: '/harvest/crop',
          params: { imageUri: result.assets[0].uri }
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Show preview if photo is captured
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Image source={{ uri: capturedPhoto }} style={styles.preview} resizeMode="contain" />
        
        {/* Preview Header */}
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Photo Preview</Text>
        </View>

        {/* Preview Controls */}
        <View style={styles.previewControls}>
          <Button
            title="Retake"
            onPress={handleRetake}
            style={styles.previewButton}
          />
          <Button
            title="Next →"
            onPress={handleNext}
            variant="gradient"
            style={styles.previewButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />

      {/* Header - positioned absolutely */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Capture Image</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Overlay Instructions - positioned absolutely */}
      <View style={styles.overlay}>
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            💳 Place a CREDIT/DEBIT CARD near the aloe plant
          </Text>
          <Text style={styles.instructionSubtext}>
            Card must be fully visible in the frame
          </Text>
        </View>
      </View>

      {/* Bottom Controls - positioned absolutely */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handlePickImage}
        >
          <Text style={styles.galleryIcon}>🖼️</Text>
          <Text style={styles.galleryText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, isTakingPhoto && styles.captureButtonDisabled]}
          onPress={handleTakePhoto}
          disabled={isTakingPhoto}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  message: {
    flex: 1,
    textAlign: 'center',
    paddingTop: 100,
    fontSize: 16,
    color: '#546E7A',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA',
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#546E7A',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    width: '100%',
    marginBottom: 12,
  },
  backButtonAlt: {
    width: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  overlay: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 5,
  },
  instructionBox: {
    backgroundColor: 'rgba(27, 94, 32, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  instructionSubtext: {
    fontSize: 13,
    color: '#E8F5E9',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 50,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  galleryButton: {
    alignItems: 'center',
    gap: 4,
  },
  preview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  previewButton: {
    flex: 1,
  },
  galleryIcon: {
    fontSize: 28,
  },
  galleryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
  },
});
