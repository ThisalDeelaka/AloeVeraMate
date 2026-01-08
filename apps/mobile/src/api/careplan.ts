export async function getMissRisk(taskId: string) {
  const res = await axios.post(`${BASE_URL}/tasks/${taskId}/miss_risk`);
  return res.data;
}

export async function applyAdaptivePolicy(taskId: string) {
  const res = await axios.post(`${BASE_URL}/tasks/${taskId}/apply_adaptive_policy`);
  return res.data;
}
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/careplan'; // Adjust for your backend IP if needed

export async function getTemplates() {
  const res = await axios.get(`${BASE_URL}/templates`);
  return res.data;
}

export async function createPlan(data: {
  disease_id: string;
  disease_name: string;
  treatment_mode: 'SCIENTIFIC' | 'AYURVEDIC';
  start_date: string;
  user_id?: string;
}) {
  const res = await axios.post(`${BASE_URL}/plans`, data);
  return res.data;
}

export async function listPlans() {
  const res = await axios.get(`${BASE_URL}/plans`);
  return res.data;
}

export async function getPlan(planId: string) {
  const res = await axios.get(`${BASE_URL}/plans/${planId}`);
  return res.data;
}

export async function completeTask(taskId: string) {
  const res = await axios.post(`${BASE_URL}/tasks/${taskId}/complete`);
  return res.data;
}

export async function rescheduleTask(taskId: string, newTime: string) {
  const res = await axios.post(`${BASE_URL}/tasks/${taskId}/reschedule`, { new_scheduled_at: newTime });
  return res.data;
}
