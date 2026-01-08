import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function CarePlanChatScreen() {
  const { planId } = useLocalSearchParams();
  // Placeholder for chat UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat for Plan #{planId}</Text>
      <Text style={styles.text}>Chat UI goes here (bound to plan).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 22, marginBottom: 20 }
});
