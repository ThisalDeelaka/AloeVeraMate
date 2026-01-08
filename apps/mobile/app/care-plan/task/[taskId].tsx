import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlan, completeTask, getMissRisk, applyAdaptivePolicy, rescheduleTask } from '../../../src/api/careplan';
function RiskBadge({ band }: { band: string }) {
  const color = band === 'HIGH' ? '#d32f2f' : band === 'MEDIUM' ? '#fbc02d' : '#388e3c';
  return <Text style={{ backgroundColor: color, color: '#fff', paddingHorizontal: 10, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 6 }}>{band} RISK</Text>;
}
  const [missRisk, setMissRisk] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(false);

export default function TaskScreen() {
  const { taskId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<any>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
      // Fetch miss risk
      setRiskLoading(true);
      getMissRisk(String(taskId)).then(setMissRisk).catch(()=>{}).finally(()=>setRiskLoading(false));
    // Find the plan containing this task (inefficient, but works for now)
    setLoading(true); setError(null);
    // For demo, just fetch all plans and find the task
    import('../../../src/api/careplan').then(api =>
      api.listPlans().then(res => {
        const allPlans = res.plans || [];
        let found = null;
        for (const plan of allPlans) {
          api.getPlan(plan.id).then(planRes => {
            const t = (planRes.tasks || []).find((t: any) => t.id === taskId);
            if (t) {
              setTask(t);
              setCompleted(t.status === 'COMPLETED');
              setLoading(false);
            }
          });
        }
        setTimeout(() => setLoading(false), 2000); // fallback
      }).catch(e => { setError(e.message || 'Failed to load task'); setLoading(false); })
    );
  }, [taskId]);

  const handleComplete = async () => {
    setLoading(true); setError(null);
    try {
      await completeTask(String(taskId));
      setCompleted(true);
      Alert.alert('Task marked as completed!');
    } catch (e: any) {
      setError(e.message || 'Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator color="#2E7D32" /> : error ? (
        <Text style={{ color: 'red', margin: 16 }}>{error}</Text>
      ) : !task ? (
        <Text style={{ color: '#888' }}>Task not found.</Text>
      ) : (
        <>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.text}>{task.details || 'No details.'}</Text>
          {/* AI Miss Risk */}
          {riskLoading ? <ActivityIndicator size="small" color="#888" /> : missRisk && (
            <View style={{ marginBottom: 12 }}>
              <RiskBadge band={missRisk.risk_band} />
              <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>AI Miss Risk</Text>
              <Text style={{ fontSize: 16, marginBottom: 2 }}>Probability: {(missRisk.miss_risk*100).toFixed(1)}%</Text>
              {missRisk.reasons && missRisk.reasons.length > 0 && (
                <View style={{ marginBottom: 4 }}>
                  {missRisk.reasons.map((r: string, i: number) => (
                    <Text key={i} style={{ fontSize: 14, color: '#555' }}>• {r}</Text>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={{ backgroundColor: '#1976d2', padding: 10, borderRadius: 8, marginTop: 6, alignSelf: 'flex-start' }}
                disabled={policyLoading}
                onPress={async () => {
                  setPolicyLoading(true);
                  try {
                    await applyAdaptivePolicy(String(taskId));
                    Alert.alert('Smart Reminder Plan applied!');
                  } catch {
                    Alert.alert('Failed to apply policy');
                  } finally {
                    setPolicyLoading(false);
                  }
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Apply Smart Reminder Plan</Text>
              </TouchableOpacity>
              {/* High risk quick actions */}
              {missRisk.risk_band === 'HIGH' && (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Suggested reschedule:</Text>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={async () => {
                      // Move to evening 6pm
                      const sched = new Date();
                      sched.setHours(18,0,0,0);
                      if (sched < new Date()) sched.setDate(sched.getDate()+1);
                      await rescheduleTask(String(taskId), sched.toISOString());
                      Alert.alert('Task rescheduled to 6pm!');
                    }}
                  >
                    <Text style={styles.quickBtnText}>Move to evening (6pm)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={async () => {
                      // Move to tomorrow 8am
                      const sched = new Date();
                      sched.setDate(sched.getDate()+1);
                      sched.setHours(8,0,0,0);
                      await rescheduleTask(String(taskId), sched.toISOString());
                      Alert.alert('Task rescheduled to 8am tomorrow!');
                    }}
                  >
                    <Text style={styles.quickBtnText}>Move to tomorrow morning (8am)</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          <Button
            title={completed ? 'Completed' : 'Mark Completed'}
            onPress={handleComplete}
            color={completed ? '#2E7D32' : undefined}
            disabled={completed}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 22, marginBottom: 20 },
  quickBtn: { backgroundColor: '#fbc02d', padding: 8, borderRadius: 8, marginBottom: 8, alignSelf: 'flex-start' },
  quickBtnText: { color: '#333', fontWeight: 'bold' }
});
