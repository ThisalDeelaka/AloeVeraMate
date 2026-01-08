import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTemplates, createPlan } from '../../src/api/careplan';

export default function CreatePlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [templates, setTemplates] = useState<any>({});
  const [diseaseId, setDiseaseId] = useState(
    (params.diseaseId as string) || ''
  );
  const [mode, setMode] = useState<'SCIENTIFIC' | 'AYURVEDIC'>(
    (params.mode as 'SCIENTIFIC' | 'AYURVEDIC') || 'SCIENTIFIC'
  );
  const [startDate, setStartDate] = useState('2026-01-08');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTemplates().then(setTemplates).catch(() => setTemplates({}));
  }, []);

  const diseaseOptions = Object.keys(templates);
  const modeOptions = ['SCIENTIFIC', 'AYURVEDIC'];

  const handleCreate = async () => {
    if (!diseaseId || !mode || !startDate) return setError('All fields required');
    setLoading(true); setError(null);
    try {
      const diseaseName = templates[diseaseId]?.[mode]?.disease_name || diseaseId;
      const res = await createPlan({ disease_id: diseaseId, disease_name: diseaseName, treatment_mode: mode, start_date: startDate });
      router.replace(`/care-plan/plan/${res.plan.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Care Plan</Text>
      <Text style={styles.text}>Select a disease, mode, and start date.</Text>
      <Text style={styles.label}>Disease</Text>
      <Picker selectedValue={diseaseId} onValueChange={setDiseaseId} style={styles.picker}>
        <Picker.Item label="Select disease..." value="" />
        {diseaseOptions.map(did => (
          <Picker.Item key={did} label={did} value={did} />
        ))}
      </Picker>
      <Text style={styles.label}>Mode</Text>
      <Picker
        selectedValue={mode}
        onValueChange={(v: 'SCIENTIFIC' | 'AYURVEDIC') => setMode(v)}
        style={styles.picker}
      >
        {modeOptions.map(m => (
          <Picker.Item key={m} label={m} value={m} />
        ))}
      </Picker>
      <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
      <TextInput value={startDate} onChangeText={setStartDate} style={styles.input} />
      {error && <Text style={{ color: 'red', marginVertical: 8 }}>{error}</Text>}
      {loading ? <ActivityIndicator color="#2E7D32" /> : <Button title="Create Plan" onPress={handleCreate} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 22, marginBottom: 20 },
  label: { fontWeight: 'bold', marginTop: 10 },
  picker: { marginVertical: 6, backgroundColor: '#f0f0f0' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginVertical: 6 },
});
