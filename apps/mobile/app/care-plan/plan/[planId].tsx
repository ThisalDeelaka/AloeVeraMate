import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPlan } from '../../../src/api/careplan';

export default function PlanScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true); setError(null);
    getPlan(String(planId))
      .then(res => { setPlan(res.plan); setTasks(res.tasks || []); })
      .catch(e => setError(e.message || 'Failed to load plan'))
      .finally(() => setLoading(false));
  }, [planId]);

  // Group tasks by date
  const grouped = tasks.reduce((acc, t) => {
    const date = t.scheduled_at?.slice(0, 10) || 'Unknown';
    acc[date] = acc[date] || [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, typeof tasks>);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? <ActivityIndicator color="#2E7D32" /> : error ? (
        <Text style={{ color: 'red', margin: 16 }}>{error}</Text>
      ) : !plan ? null : (
        <>
          <Text style={styles.title}>{plan.disease_name} ({plan.treatment_mode})</Text>
          <Text style={styles.meta}>Start: {plan.start_date}</Text>
          {Object.entries(grouped).map(([date, tasks]) => (
            <View key={date} style={styles.group}>
              <Text style={styles.date}>{date}</Text>
              {tasks.map(task => (
                <TouchableOpacity key={task.id} style={styles.taskRow} onPress={() => router.push(`/care-plan/task/${task.id}`)}>
                  <Text style={[styles.taskTitle, task.status === 'COMPLETED' && { textDecorationLine: 'line-through', color: '#2E7D32' }]}>{task.title}</Text>
                  <Text style={styles.taskStatus}>{task.status}</Text>
                  <Text style={styles.taskArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <Button title="Open Chat" onPress={() => router.push(`/care-plan/chat/${planId}`)} />
          <Button title="Add Task" onPress={() => {}} color="#888" />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  meta: { color: '#888', marginBottom: 16 },
  group: { marginBottom: 18 },
  date: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 6 },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12, paddingVertical: 6 },
  taskTitle: { flex: 1, fontSize: 16 },
  taskStatus: { fontSize: 13, color: '#888', marginRight: 8 },
  taskArrow: { fontSize: 18, color: '#888' },
});
